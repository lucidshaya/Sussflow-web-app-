import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Package } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { OrderStatusBadge } from "@/components/site/OrderStatusBadge";
import { focusFirstError, FormField } from "@/components/site/FormField";
import { EmptyState, glassCard, PageHero } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { formatDate, formatNaira } from "@/lib/format";
import { supabase, unwrap } from "@/lib/supabase";
import type { Order, Profile } from "@/lib/types";
import { profileSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { privatePage } from "@/lib/seo";

export const Route = createFileRoute("/_site/account/")({
  head: () => privatePage("My account | Sussflow"),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", search: { redirect: "/account" } });
  }, [loading, user, navigate]);

  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () =>
      unwrap<Profile | null>(
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", user?.id ?? "")
          .maybeSingle(),
      ),
  });
  const orders = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: Boolean(user),
    queryFn: async () =>
      unwrap<Order[]>(
        await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user?.id ?? "")
          .order("created_at", { ascending: false }),
      ),
  });

  const [form, setForm] = useState({ full_name: "", phone: "", address: "", city: "", state: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  useEffect(() => {
    if (profile.data)
      setForm({
        full_name: profile.data.full_name ?? "",
        phone: profile.data.phone ?? "",
        address: profile.data.address ?? "",
        city: profile.data.city ?? "",
        state: profile.data.state ?? "",
      });
  }, [profile.data]);

  const save = useMutation({
    mutationFn: async (values: {
      full_name: string;
      phone?: string | undefined;
      address?: string | undefined;
      city?: string | undefined;
      state?: string | undefined;
    }) => {
      if (!user) return;
      unwrap(
        await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email,
            full_name: values.full_name,
            phone: values.phone ?? null,
            address: values.address ?? null,
            city: values.city ?? null,
            state: values.state ?? null,
          })
          .select(),
      );
    },
    onSuccess: () => {
      toast.success("Profile saved");
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => toast.error(error.message),
  });

  if (!user) return null;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = toFieldErrors(result.error);
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
      return;
    }
    setErrors({});
    save.mutate(result.data);
  };

  return (
    <>
      <PageHero
        eyebrow="My account"
        title={`Hi${form.full_name ? `, ${form.full_name.split(" ")[0]}` : ""}!`}
      >
        <span className="text-sm">{user.email}</span>
      </PageHero>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[1fr_380px]">
        <div className={`${glassCard} p-6 md:p-8`}>
          <h2 className="font-display text-xl font-semibold">Order history</h2>
          {orders.isLoading ? (
            <p className="mt-4 text-sm text-foreground/60">Loading…</p>
          ) : orders.data?.length ? (
            <ul className="mt-4 divide-y divide-foreground/10">
              {orders.data.map((order) => (
                <li key={order.id}>
                  <Link
                    to="/account/orders/$id"
                    params={{ id: order.id }}
                    className="flex items-center justify-between gap-3 py-4 hover:text-brand"
                  >
                    <span className="flex items-center gap-3">
                      <Package className="size-5 text-brand" />
                      <span>
                        <span className="block font-semibold">{order.reference}</span>
                        <span className="block text-xs text-foreground/60">
                          {formatDate(order.created_at)}
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} fulfilment={order.fulfilment} />
                      <span className="font-semibold">{formatNaira(order.total)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyState title="No orders yet">
                <Link to="/shop" className="font-semibold text-brand hover:underline">
                  Start shopping →
                </Link>
              </EmptyState>
            </div>
          )}
        </div>
        <form onSubmit={onSubmit} noValidate className={`${glassCard} h-fit space-y-3 p-6`}>
          <h2 className="font-display text-xl font-semibold">Delivery details</h2>
          <p className="text-xs text-foreground/60">Saved details pre-fill checkout.</p>
          {(
            [
              ["full_name", "Full name", "name", "text", true],
              ["phone", "Phone", "tel", "tel", false],
              ["address", "Address", "street-address", "text", false],
              ["city", "City / area", "address-level2", "text", false],
              ["state", "State", "address-level1", "text", false],
            ] as const
          ).map(([key, label, autoComplete, type, required]) => (
            <FormField
              key={key}
              name={key}
              label={label}
              type={type}
              required={required}
              autoComplete={autoComplete}
              inputMode={type === "tel" ? "tel" : "text"}
              hint={key === "phone" ? "At least 9 digits" : undefined}
              value={form[key]}
              error={errors[key]}
              onChange={(value) => {
                setForm((f) => ({ ...f, [key]: value }));
                if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
              }}
            />
          ))}
          <Button type="submit" className="w-full" disabled={save.isPending}>
            Save details
          </Button>
          <Button
            type="button"
            variant="glass"
            className="w-full"
            onClick={() => void signOut().then(() => navigate({ to: "/" }))}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </form>
      </section>
    </>
  );
}
