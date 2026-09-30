import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Lock, MapPin, Truck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { focusFirstError, FormField } from "@/components/site/FormField";
import {
  EmptyState,
  FieldError,
  fieldClass,
  glassCard,
  invalidField,
  PageHero,
  SetupNotice,
} from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { getAccessToken, useAuth } from "@/lib/auth";
import { useCart, useCartDetails } from "@/lib/cart";
import { formatNaira } from "@/lib/format";
import { settingsQuery } from "@/lib/queries";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Fulfilment, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  checkoutCustomerSchema,
  readableError,
  toFieldErrors,
  type FieldErrors,
} from "@/lib/validation";
import { initCheckout } from "@/functions/payments";
import { privatePage } from "@/lib/seo";

export const Route = createFileRoute("/_site/checkout/")({
  head: () => privatePage("Checkout | Sussflow"),
  component: CheckoutPage,
});

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

function CheckoutPage() {
  const { lines } = useCart();
  const { items, subtotal, isLoading } = useCartDetails();
  const { user } = useAuth();
  const { data: settings } = useQuery(settingsQuery);
  const startCheckout = useServerFn(initCheckout);

  const [fulfilment, setFulfilment] = useState<Fulfilment>("delivery");
  const [state, setState] = useState("Lagos");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  // Prefill from the customer's profile when signed in.
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const profile = data as Profile | null;
        setForm((f) => ({
          ...f,
          email: f.email || user.email || "",
          fullName: f.fullName || profile?.full_name || "",
          phone: f.phone || profile?.phone || "",
          address: f.address || profile?.address || "",
          city: f.city || profile?.city || "",
        }));
        if (profile?.state) setState(profile.state);
      });
  }, [user]);

  const isLagos = state.toLowerCase().includes("lagos");
  let deliveryFee = 0;
  if (fulfilment === "delivery" && settings) {
    deliveryFee = isLagos ? settings.lagos_delivery_fee : settings.nationwide_delivery_fee;
    if (settings.free_delivery_threshold != null && subtotal >= settings.free_delivery_threshold)
      deliveryFee = 0;
  }
  const total = subtotal + deliveryFee;

  const validate = () => checkoutCustomerSchema.safeParse({ ...form, fulfilment, state });

  /** Re-check one field when the customer leaves it, so mistakes show early. */
  const checkField = (key: string) => {
    const result = validate();
    const message = result.success ? undefined : toFieldErrors(result.error)[key];
    setErrors((e) => ({ ...e, [key]: message }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = validate();
    if (!result.success) {
      const fieldErrors = toFieldErrors(result.error);
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const { data } = result;
      const response = await startCheckout({
        data: {
          accessToken: await getAccessToken(),
          items: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
          ...data,
        },
      });
      window.location.href = response.authorizationUrl;
    } catch (error) {
      toast.error(readableError(error, "Could not start payment"));
      setBusy(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <SetupNotice what="checkout" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <EmptyState title="Your bag is empty">
          <Link to="/shop" className="font-semibold text-brand hover:underline">
            Shop all products →
          </Link>
        </EmptyState>
      </div>
    );
  }

  const field = (key: keyof typeof form) => ({
    name: key,
    value: form[key],
    error: errors[key],
    onChange: (value: string) => {
      setForm((f) => ({ ...f, [key]: value }));
      if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    },
    onBlur: () => {
      if (form[key]) checkField(key);
    },
  });
  const deliveryNote =
    fulfilment === "delivery" && deliveryFee === 0
      ? "Delivery fee is confirmed by our team after your order and may be paid to the rider on arrival."
      : null;

  return (
    <>
      <PageHero eyebrow="Checkout" title="Almost there." />
      <form
        onSubmit={submit}
        noValidate
        className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-6">
          <section className={`${glassCard} p-6 md:p-8`}>
            <h2 className="font-display text-xl font-semibold">Contact details</h2>
            {!user && (
              <p className="mt-1 text-sm text-foreground/60">
                Checking out as a guest.{" "}
                <Link
                  to="/auth"
                  search={{ redirect: "/checkout" }}
                  className="font-semibold text-brand hover:underline"
                >
                  Sign in
                </Link>{" "}
                to save your order history.
              </p>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <FormField
                {...field("fullName")}
                label="Full name"
                required
                autoComplete="name"
                maxLength={120}
                className="sm:col-span-2"
              />
              <FormField
                {...field("email")}
                label="Email"
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={254}
                hint="Your Paystack receipt is sent here."
              />
              <FormField
                {...field("phone")}
                label="Phone"
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={20}
                placeholder="0801 234 5678"
                hint="At least 9 digits, e.g. 0801 234 5678 or +234 801 234 5678"
              />
            </div>
          </section>

          <section className={`${glassCard} p-6 md:p-8`}>
            <h2 className="font-display text-xl font-semibold">
              How would you like to get your order?
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <FulfilmentOption
                active={fulfilment === "delivery"}
                onClick={() => setFulfilment("delivery")}
                icon={<Truck className="size-5" />}
                title="Delivery"
                body="Dispatch in Lagos · courier or waybill nationwide"
              />
              <FulfilmentOption
                active={fulfilment === "pickup"}
                onClick={() => setFulfilment("pickup")}
                icon={<MapPin className="size-5" />}
                title="Lagos pickup"
                body={settings?.pickup_address ?? "Iju axis, Lagos"}
              />
            </div>
            {fulfilment === "delivery" ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <FormField
                  {...field("address")}
                  label="Address"
                  required
                  autoComplete="street-address"
                  maxLength={300}
                  placeholder="House number, street, landmark"
                  className="sm:col-span-2"
                />
                <FormField
                  {...field("city")}
                  label="City / area"
                  autoComplete="address-level2"
                  maxLength={80}
                />
                <label htmlFor="state" className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase text-foreground/60">
                    State *
                  </span>
                  <select
                    id="state"
                    name="state"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setErrors((er) => ({ ...er, state: undefined }));
                    }}
                    aria-invalid={errors["state"] ? true : undefined}
                    className={cn(fieldClass, errors["state"] && invalidField)}
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <FieldError id="state-error" message={errors["state"]} />
                </label>
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-glass-border bg-glass-soft p-4 text-sm text-foreground/70">
                {settings?.pickup_instructions ??
                  "We'll contact you when your order is ready for pickup at our Iju-area Lagos location."}
              </p>
            )}
            <FormField
              {...field("notes")}
              as="textarea"
              label="Order notes"
              rows={2}
              maxLength={500}
              placeholder="Anything we should know?"
              className="mt-3"
            />
          </section>
        </div>

        <aside className={`${glassCard} h-fit p-6 lg:sticky lg:top-36`}>
          <h2 className="font-display text-xl font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {isLoading && <li className="text-sm text-foreground/60">Loading…</li>}
            {items.map((item) => (
              <li key={item.variantId} className="flex items-center gap-3 text-sm">
                <img
                  src={item.imageUrl ?? "/images/pads.jpg"}
                  alt=""
                  className="size-12 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.productName}</p>
                  <p className="text-xs text-foreground/60">
                    {item.label ? `${item.label} · ` : ""}× {item.quantity}
                  </p>
                </div>
                <span className="font-semibold">{formatNaira(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-foreground/10 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground/65">Subtotal</dt>
              <dd className="font-semibold">{formatNaira(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/65">
                {fulfilment === "pickup" ? "Pickup" : "Delivery"}
              </dt>
              <dd className="font-semibold">
                {fulfilment === "pickup"
                  ? "₦0"
                  : deliveryFee
                    ? formatNaira(deliveryFee)
                    : "Confirmed after order"}
              </dd>
            </div>
            <div className="flex justify-between border-t border-foreground/10 pt-3 text-base">
              <dt className="font-semibold">Total today</dt>
              <dd className="font-display text-xl font-semibold text-brand">
                {formatNaira(total)}
              </dd>
            </div>
          </dl>
          {deliveryNote && <p className="mt-3 text-xs text-foreground/55">{deliveryNote}</p>}
          <Button
            type="submit"
            className="mt-5 w-full"
            disabled={busy || isLoading || items.length === 0}
          >
            <Lock className="size-4" />{" "}
            {busy ? "Redirecting to Paystack…" : `Pay ${formatNaira(total)} with Paystack`}
          </Button>
          <p className="mt-3 text-center text-xs text-foreground/50">
            Secure payment by Paystack · cards, bank transfer & USSD
          </p>
        </aside>
      </form>
    </>
  );
}

function FulfilmentOption({
  active,
  onClick,
  icon,
  title,
  body,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex gap-3 rounded-2xl border p-4 text-left transition-colors",
        active
          ? "border-brand bg-brand/10"
          : "border-glass-border bg-glass-soft hover:border-brand/40",
      )}
    >
      <span className={cn("mt-0.5", active ? "text-brand" : "text-foreground/60")}>{icon}</span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-xs text-foreground/60">{body}</span>
      </span>
    </button>
  );
}
