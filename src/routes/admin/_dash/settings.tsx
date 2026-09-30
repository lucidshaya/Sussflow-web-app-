import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, UserPlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  AdminField,
  adminInvalid,
  adminCard,
  adminInput,
  AdminPageHeader,
  ConfirmDelete,
  ErrorNote,
  Loading,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { getAccessToken, useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { settingsQuery } from "@/lib/queries";
import { supabase, unwrap } from "@/lib/supabase";
import type { Settings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { emailSchema, settingsSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { grantAdmin, listAdmins, revokeAdmin } from "@/functions/admin";

const SOCIAL_FIELDS = [
  { key: "tiktok_url", label: "TikTok link", placeholder: "https://www.tiktok.com/@…" },
  { key: "facebook_url", label: "Facebook link", placeholder: "https://facebook.com/…" },
  { key: "linkedin_url", label: "LinkedIn link", placeholder: "https://www.linkedin.com/company/…" },
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
      <div className="grid gap-5 xl:grid-cols-2">
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
        const result = settingsSchema.safeParse({
          lagos_delivery_fee: draft.lagos_delivery_fee,
          nationwide_delivery_fee: draft.nationwide_delivery_fee,
          free_delivery_threshold: draft.free_delivery_threshold,
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
      <h2 className="font-display text-lg font-semibold">Store & delivery</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminField
          error={errors["lagos_delivery_fee"]}
          label="Lagos delivery fee (₦)"
          hint="0 = confirmed after order / paid to rider"
        >
          <input
            type="number"
            min={0}
            step={50}
            className={cls("lagos_delivery_fee")}
            {...money("lagos_delivery_fee")}
          />
        </AdminField>
        <AdminField
          error={errors["nationwide_delivery_fee"]}
          label="Outside Lagos fee (₦)"
          hint="0 = confirmed after order / paid to rider"
        >
          <input
            type="number"
            min={0}
            step={50}
            className={cls("nationwide_delivery_fee")}
            {...money("nationwide_delivery_fee")}
          />
        </AdminField>
        <AdminField
          error={errors["free_delivery_threshold"]}
          label="Free delivery from (₦)"
          hint="Leave empty to disable"
        >
          <input
            type="number"
            min={0}
            step={500}
            className={cls("free_delivery_threshold")}
            value={draft.free_delivery_threshold != null ? draft.free_delivery_threshold / 100 : ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                free_delivery_threshold:
                  e.target.value === "" ? null : Math.round(Number(e.target.value) * 100),
              })
            }
          />
        </AdminField>
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
