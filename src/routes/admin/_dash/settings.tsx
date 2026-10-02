import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, UserPlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  LeafSwitch,
  AdminField,
  adminInvalid,
  adminCard,
  adminInput,
  AdminPageHeader,
  ConfirmDelete,
  ErrorNote,
  Loading,
} from "@/components/admin/ui";
import { LagosAreasEditor } from "@/components/admin/LagosAreasEditor";
import { RewardsSettings } from "@/components/admin/RewardsSettings";
import { Button } from "@/components/ui/button";
import { getAccessToken, useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { settingsQuery } from "@/lib/queries";
import { supabase, unwrap } from "@/lib/supabase";
import type { Settings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { emailSchema, settingsSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { grantAdmin, listAdmins, revokeAdmin } from "@/functions/admin";
import { DELIVERY_ZONES, deliveryRates, zoneFee } from "@/lib/delivery";

const SOCIAL_FIELDS = [
  { key: "tiktok_url", label: "TikTok link", placeholder: "https://www.tiktok.com/@…" },
  { key: "facebook_url", label: "Facebook link", placeholder: "https://facebook.com/…" },
  {
    key: "linkedin_url",
    label: "LinkedIn link",
    placeholder: "https://www.linkedin.com/company/…",
  },
  { key: "x_url", label: "X (Twitter) link", placeholder: "https://x.com/…" },
  {
    key: "google_business_url",
    label: "Google Business link",
    placeholder: "https://g.page/… or a Google Maps link",
  },
] as const;
type SocialKey = (typeof SOCIAL_FIELDS)[number]["key"];

export const Route = createFileRoute("/admin/_dash/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Delivery fees, pickup details, contact links and admin access."
      />
      <div className="grid gap-5 xl:grid-cols-2 [&>*]:min-w-0">
        <StoreSettings />
        <AdminUsers />
      </div>
    </>
  );
}

function StoreSettings() {
  const queryClient = useQueryClient();
  const settings = useQuery(settingsQuery);
  const [draft, setDraft] = useState<Settings | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  useEffect(() => {
    if (settings.data) setDraft(settings.data);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async (values: Settings) => {
      const { id: _id, ...rest } = values;
      unwrap(
        await supabase
          .from("settings")
          .upsert({ id: 1, ...rest })
          .select(),
      );
    },
    onSuccess: () => {
      toast.success("Settings saved");
      void queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error) => toast.error(error.message),
  });

  if (settings.isLoading) return <Loading />;
  if (!draft)
    return (
      <ErrorNote
        error={
          settings.error ??
          new Error("Settings row missing — run supabase/migrations/0002_seed.sql")
        }
      />
    );

  // Social columns arrive with migrations 0004/0005; show only the ones that exist.
  const socials = SOCIAL_FIELDS.filter(({ key }) => key in draft);
  const cls = (key: string) => cn(adminInput, errors[key] && adminInvalid);
  const clear = (key: string) => {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const money = (key: "lagos_delivery_fee" | "nationwide_delivery_fee") => ({
    value: draft[key] / 100,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setDraft({ ...draft, [key]: Math.round(Number(e.target.value) * 100) || 0 });
      clear(key);
    },
  });
  const text = (
    key:
      | "pickup_address"
      | "pickup_instructions"
      | "contact_email"
      | "contact_phone"
      | "whatsapp_url"
      | "instagram_url"
      | SocialKey,
  ) => ({
    value: draft[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDraft({ ...draft, [key]: e.target.value || (key === "pickup_address" ? "" : null) });
      clear(key);
    },
  });

  return (
    <form
      className={`${adminCard} space-y-4`}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const bannerErrors: FieldErrors = {};
        if ((draft.announcement_enabled ?? true) && !(draft.announcement_text ?? "").trim())
          bannerErrors["announcement_text"] = "Add the banner text (or switch the banner off)";
        if (
          draft.announcement_link &&
          !/^(\/[\w\-/?=&#.]*|https:\/\/\S+)$/.test(draft.announcement_link)
        )
          bannerErrors["announcement_link"] = "Use a page like /deals or a full https:// link";
        const areaList = Array.isArray(draft.lagos_areas)
          ? (draft.lagos_areas as { name?: string }[])
          : [];
        const names = areaList.map((a) => (a.name ?? "").trim().toLowerCase());
        if (names.some((n) => !n)) bannerErrors["lagos_areas"] = "Give every Lagos area a name";
        else if (new Set(names).size !== names.length)
          bannerErrors["lagos_areas"] = "Two Lagos areas have the same name";
        if ((draft.reward_spend_per_point ?? 1) < 100)
          bannerErrors["reward_spend_per_point"] = "Enter at least ₦1";
        if ((draft.reward_point_value ?? 1) < 1)
          bannerErrors["reward_point_value"] = "Enter an amount above ₦0";
        if (Object.keys(bannerErrors).length) {
          setErrors(bannerErrors);
          toast.error("Please fix the highlighted fields.");
          return;
        }
        const result = settingsSchema.safeParse({
          lagos_delivery_fee: draft.lagos_delivery_fee,
          nationwide_delivery_fee: draft.nationwide_delivery_fee,
          free_delivery_threshold: null,
          pickup_address: draft.pickup_address ?? "",
          pickup_instructions: draft.pickup_instructions ?? "",
          contact_email: draft.contact_email ?? "",
          contact_phone: draft.contact_phone ?? "",
          whatsapp_url: draft.whatsapp_url ?? "",
          instagram_url: draft.instagram_url ?? "",
          ...Object.fromEntries(socials.map(({ key }) => [key, draft[key] ?? ""])),
        });
        if (!result.success) {
          setErrors(toFieldErrors(result.error));
          toast.error("Please fix the highlighted fields.");
          return;
        }
        setErrors({});
        const {
          tiktok_url: _tiktok,
          facebook_url: _facebook,
          linkedin_url: _linkedin,
          x_url: _x,
          google_business_url: _google,
          ...v
        } = result.data;
        // Only send social columns that exist in the database (see migrations 0004/0005).
        const socialValues = Object.fromEntries(
          socials.map(({ key }) => [key, result.data[key] ?? null]),
        ) as Partial<Record<SocialKey, string | null>>;
        save.mutate({
          ...draft,
          ...v,
          pickup_instructions: v.pickup_instructions ?? null,
          contact_email: v.contact_email ?? null,
          contact_phone: v.contact_phone ?? null,
          whatsapp_url: v.whatsapp_url ?? null,
          instagram_url: v.instagram_url ?? null,
          ...socialValues,
        });
      }}
    >
      <RewardsSettings draft={draft} setDraft={setDraft} errors={errors} />

      <h2 className="font-display text-lg font-semibold">Top banner</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center justify-between gap-3 rounded-xl border border-glass-border bg-glass px-3 py-2 text-sm font-semibold sm:col-span-2">
          Show the banner at the top of the home page
          <LeafSwitch
            checked={draft.announcement_enabled ?? true}
            onCheckedChange={(checked) => setDraft({ ...draft, announcement_enabled: checked })}
            aria-label="Show the banner"
          />
        </label>
        <AdminField
          error={errors["announcement_text"]}
          label="Banner text"
          hint="Up to 140 characters, e.g. “Website-only deals are live · Shop deals”"
        >
          <input
            value={draft.announcement_text ?? ""}
            maxLength={140}
            onChange={(e) => {
              setDraft({ ...draft, announcement_text: e.target.value });
              clear("announcement_text");
            }}
            className={cls("announcement_text")}
          />
        </AdminField>
        <AdminField
          error={errors["announcement_link"]}
          label="Banner link (optional)"
          hint="A page on the site like /deals, or a full https:// link. Empty = not clickable."
        >
          <input
            value={draft.announcement_link ?? ""}
            onChange={(e) => {
              setDraft({ ...draft, announcement_link: e.target.value.trim() || null });
              clear("announcement_link");
            }}
            placeholder="/deals"
            className={cls("announcement_link")}
          />
        </AdminField>
      </div>

      <h2 className="font-display text-lg font-semibold">Store & delivery</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <LagosAreasEditor draft={draft} setDraft={setDraft} />
        {errors["lagos_areas"] && (
          <p role="alert" className="text-xs font-medium text-alert sm:col-span-2">
            {errors["lagos_areas"]}
          </p>
        )}
        <AdminField
          error={errors["lagos_delivery_fee"]}
          label="Lagos fee if no areas are listed (₦)"
          hint="Only used when the list above is empty"
        >
          <input
            type="number"
            min={0}
            step={50}
            className={cls("lagos_delivery_fee")}
            {...money("lagos_delivery_fee")}
          />
        </AdminField>
        <p className="text-xs font-semibold uppercase text-foreground/55 sm:col-span-2">
          Waybill fees by region (₦)
        </p>
        {DELIVERY_ZONES.map((zone) => (
          <AdminField key={zone.id} label={zone.name} hint={zone.states.join(", ")}>
            <input
              type="number"
              min={0}
              step={50}
              className={adminInput}
              value={zoneFee(draft, zone.id) / 100}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  zone_fees: {
                    ...draft.zone_fees,
                    [zone.id]: Math.max(0, Math.round(Number(e.target.value) * 100) || 0),
                  },
                })
              }
            />
          </AdminField>
        ))}
        <div className="rounded-2xl border border-glass-border bg-glass-soft p-3 text-xs sm:col-span-2">
          <p className="font-semibold">Customers see (bag, checkout and Store & delivery page):</p>
          <ul className="mt-1.5 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {deliveryRates(draft).map((rate) => (
              <li key={rate.label}>
                <span className="text-foreground/60">{rate.label}:</span> {rate.value}
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-foreground/55">
            Checkout adds the fee to the total customers pay through Paystack. Save to apply.
          </p>
        </div>
        <AdminField error={errors["contact_phone"]} label="Contact phone">
          <input type="tel" className={cls("contact_phone")} {...text("contact_phone")} />
        </AdminField>
        <AdminField error={errors["contact_email"]} label="Contact email">
          <input type="email" className={cls("contact_email")} {...text("contact_email")} />
        </AdminField>
        <AdminField
          error={errors["whatsapp_url"]}
          label="WhatsApp link"
          hint="Powers the “Message us” button"
        >
          <input
            className={cls("whatsapp_url")}
            placeholder="https://wa.me/234… or 0801 234 5678"
            {...text("whatsapp_url")}
          />
        </AdminField>
        <AdminField error={errors["instagram_url"]} label="Instagram link">
          <input
            type="url"
            placeholder="https://instagram.com/…"
            className={cls("instagram_url")}
            {...text("instagram_url")}
          />
        </AdminField>
        {socials.map(({ key, label, placeholder }) => (
          <AdminField key={key} error={errors[key]} label={label}>
            <input type="url" placeholder={placeholder} className={cls(key)} {...text(key)} />
          </AdminField>
        ))}
      </div>
      <AdminField error={errors["pickup_address"]} label="Pickup address">
        <input required className={cls("pickup_address")} {...text("pickup_address")} />
      </AdminField>
      <AdminField error={errors["pickup_instructions"]} label="Pickup instructions">
        <textarea
          rows={3}
          className={cls("pickup_instructions")}
          {...text("pickup_instructions")}
        />
      </AdminField>
      <Button type="submit" disabled={save.isPending}>
        Save settings
      </Button>
    </form>
  );
}

function AdminUsers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const list = useServerFn(listAdmins);
  const grant = useServerFn(grantAdmin);
  const revoke = useServerFn(revokeAdmin);
  const [email, setEmail] = useState("");

  const admins = useQuery({
    queryKey: ["admin", "admins"],
    queryFn: async () => list({ data: { accessToken: await getAccessToken() } }),
  });

  const add = async (event: FormEvent) => {
    event.preventDefault();
    const check = emailSchema.safeParse(email);
    if (!check.success) {
      toast.error(check.error.issues[0]?.message ?? "Enter a valid email");
      return;
    }
    try {
      await grant({ data: { accessToken: await getAccessToken(), email } });
      toast.success(`${email} is now an admin`);
      setEmail("");
      void queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add admin");
    }
  };

  return (
    <section className={`${adminCard} h-fit space-y-4`}>
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <ShieldCheck className="size-5 text-brand" /> Admin access
      </h2>
      <p className="text-sm text-foreground/60">
        The person must first create an account at /auth. Then add their email here.
      </p>
      <form onSubmit={add} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teammate@sussflow.com"
          className={adminInput}
        />
        <Button type="submit" size="small" className="h-10 shrink-0">
          <UserPlus className="size-4" /> Add
        </Button>
      </form>
      <ErrorNote error={admins.error} />
      {admins.isLoading ? (
        <Loading />
      ) : (
        <ul className="divide-y divide-foreground/5 text-sm">
          {admins.data?.map((admin) => (
            <li key={admin.userId} className="flex items-center justify-between gap-3 py-2.5">
              <span>
                <span className="block font-semibold">{admin.email}</span>
                <span className="text-xs text-foreground/55">
                  Admin since {formatDate(admin.since)}
                </span>
              </span>
              {admin.userId !== user?.id && (
                <ConfirmDelete
                  title={`Remove admin access for ${admin.email}?`}
                  description="They keep their customer account but lose dashboard access."
                  onConfirm={async () => {
                    try {
                      await revoke({
                        data: { accessToken: await getAccessToken(), userId: admin.userId },
                      });
                      toast.success("Admin access removed");
                      void queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });
                    } catch (error) {
                      toast.error(
                        error instanceof Error ? error.message : "Could not remove admin",
                      );
                    }
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
