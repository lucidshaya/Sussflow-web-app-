import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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
  Pill,
} from "@/components/admin/ui";
import { OrderStatusBadge } from "@/components/site/OrderStatusBadge";
import { OrderTimeline } from "@/components/site/OrderTimeline";
import { Button } from "@/components/ui/button";
import { formatDate, formatNaira, titleCase } from "@/lib/format";
import { nextActionLabel, nextStatus, statusLabel } from "@/lib/order-flow";
import { supabase, unwrap } from "@/lib/supabase";
import {
  adminOrderCustomerSchema,
  adminOrderStatusSchema,
  toFieldErrors,
  type FieldErrors,
} from "@/lib/validation";
import { cn } from "@/lib/utils";
import { ORDER_STATUSES, type Order, type OrderStatus, type OrderWithItems } from "@/lib/types";
import { OrderPoints } from "@/components/admin/OrderPoints";

export const Route = createFileRoute("/admin/_dash/orders/$id")({
  component: OrderDetail,
});

type Editable = Pick<
  Order,
  | "status"
  | "full_name"
  | "email"
  | "phone"
  | "address"
  | "city"
  | "state"
  | "admin_notes"
  | "delivery_fee"
>;

function OrderDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const order = useQuery({
    queryKey: ["admin", "order", id],
    queryFn: async () =>
      unwrap<OrderWithItems | null>(
        await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle(),
      ),
  });

  const [draft, setDraft] = useState<Editable | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  useEffect(() => {
    if (order.data) {
      const o = order.data;
      setDraft({
        status: o.status,
        full_name: o.full_name,
        email: o.email,
        phone: o.phone,
        address: o.address,
        city: o.city,
        state: o.state,
        admin_notes: o.admin_notes,
        delivery_fee: o.delivery_fee,
      });
    }
  }, [order.data]);

  const save = useMutation({
    mutationFn: async (values: Partial<Editable>) => {
      const current = order.data;
      if (!current) return;
      const update: Record<string, unknown> = { ...values };
      if (values.delivery_fee !== undefined)
        // Keep any points discount when the delivery fee is edited.
        update["total"] = current.subtotal - (current.points_discount ?? 0) + values.delivery_fee;
      unwrap(await supabase.from("orders").update(update).eq("id", current.id).select());
    },
    onSuccess: () => {
      toast.success("Order updated");
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error) => toast.error(error.message),
  });

  if (order.isLoading || (order.data && !draft)) return <Loading />;
  if (!order.data || !draft)
    return <ErrorNote error={order.error ?? new Error("Order not found")} />;

  const o = order.data;
  const advanceTo = nextStatus(o.status);
  const set =
    (key: keyof Editable) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setDraft((d) => (d ? { ...d, [key]: e.target.value || null } : d));
      if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
    };
  const inputClass = (key: string, extra = "") =>
    cn(adminInput, extra, errors[key] && adminInvalid);

  const saveCustomer = () => {
    const result = adminOrderCustomerSchema.safeParse({
      full_name: draft.full_name,
      email: draft.email,
      phone: draft.phone,
      fulfilment: o.fulfilment,
      address: draft.address ?? "",
      city: draft.city ?? "",
      state: draft.state ?? "",
    });
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    const v = result.data;
    save.mutate({
      full_name: v.full_name,
      email: v.email,
      phone: v.phone,
      address: v.address || null,
      city: v.city ?? null,
      state: v.state ?? null,
    });
  };

  const saveStatus = () => {
    const result = adminOrderStatusSchema.safeParse({
      delivery_fee: draft.delivery_fee,
      admin_notes: draft.admin_notes ?? "",
    });
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    setErrors({});
    save.mutate({
      status: draft.status,
      admin_notes: result.data.admin_notes ?? null,
      delivery_fee: result.data.delivery_fee,
    });
  };

  return (
    <>
      <Link
        to="/admin/orders"
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 hover:text-brand"
      >
        <ChevronLeft className="size-4" /> Orders
      </Link>
      <AdminPageHeader
        title={o.reference}
        description={`Placed ${formatDate(o.created_at)}${o.paid_at ? ` · paid ${formatDate(o.paid_at)}` : ""}`}
        actions={
          <>
            <OrderStatusBadge status={o.status} fulfilment={o.fulfilment} />
            <ConfirmDelete
              title="Delete this order?"
              description="The order and its line items are permanently removed. Consider marking it Cancelled instead to keep records."
              trigger={
                <Button
                  variant="outline"
                  size="small"
                  className="hover:border-alert/50 hover:text-alert"
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              }
              onConfirm={async () => {
                const { error } = await supabase.from("orders").delete().eq("id", o.id);
                if (error) {
                  toast.error(error.message);
                  return;
                }
                toast.success("Order deleted");
                void queryClient.invalidateQueries({ queryKey: ["admin"] });
                await navigate({ to: "/admin/orders" });
              }}
            />
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
        <div className="space-y-5">
          <section className={adminCard}>
            <h2 className="font-display text-lg font-semibold">Items</h2>
            <ul className="mt-3 divide-y divide-foreground/5 text-sm">
              {o.order_items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                  <span>
                    <span className="font-semibold">{item.product_name}</span>
                    {item.variant_label && (
                      <span className="text-foreground/60"> · {item.variant_label}</span>
                    )}
                    <span className="block text-xs text-foreground/55">
                      {formatNaira(item.unit_price)} × {item.quantity}
                    </span>
                  </span>
                  <span className="font-semibold">
                    {formatNaira(item.unit_price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-foreground/10 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-foreground/60">Subtotal</dt>
                <dd>{formatNaira(o.subtotal)}</dd>
              </div>
              {(o.points_discount ?? 0) > 0 && (
                <div className="flex justify-between text-leaf">
                  <dt>Points discount</dt>
                  <dd>−{formatNaira(o.points_discount ?? 0)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-foreground/60">
                  {o.fulfilment === "pickup" ? "Lagos pickup" : "Delivery"}
                </dt>
                <dd>{formatNaira(o.delivery_fee)}</dd>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatNaira(o.total)}</dd>
              </div>
            </dl>
            <OrderPoints order={o} />
          </section>

          <section className={adminCard}>
            <h2 className="font-display text-lg font-semibold">Customer & fulfilment</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <a
                href={`mailto:${o.email}`}
                className="inline-flex items-center gap-1 rounded-full border border-glass-border bg-glass-soft px-3 py-1.5 hover:text-brand"
              >
                <Mail className="size-4" /> {o.email}
              </a>
              <a
                href={`tel:${o.phone}`}
                className="inline-flex items-center gap-1 rounded-full border border-glass-border bg-glass-soft px-3 py-1.5 hover:text-brand"
              >
                <Phone className="size-4" /> {o.phone}
              </a>
              <span className="inline-flex items-center gap-1 rounded-full border border-glass-border bg-glass-soft px-3 py-1.5">
                <MapPin className="size-4" />{" "}
                {o.fulfilment === "pickup" ? "Lagos pickup" : "Delivery"}
              </span>
              {o.user_id ? <Pill tone="brand">Registered customer</Pill> : <Pill>Guest</Pill>}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <AdminField label="Name" error={errors["full_name"]}>
                <input
                  value={draft.full_name}
                  onChange={set("full_name")}
                  className={inputClass("full_name")}
                />
              </AdminField>
              <AdminField label="Email" error={errors["email"]}>
                <input
                  value={draft.email}
                  onChange={set("email")}
                  className={inputClass("email")}
                />
              </AdminField>
              <AdminField label="Phone" error={errors["phone"]}>
                <input
                  value={draft.phone}
                  onChange={set("phone")}
                  className={inputClass("phone")}
                />
              </AdminField>
              <AdminField label="State" error={errors["state"]}>
                <input
                  value={draft.state ?? ""}
                  onChange={set("state")}
                  className={inputClass("state")}
                />
              </AdminField>
              <AdminField label="Address" wide error={errors["address"]}>
                <input
                  value={draft.address ?? ""}
                  onChange={set("address")}
                  className={inputClass("address")}
                />
              </AdminField>
              <AdminField label="City / area" error={errors["city"]}>
                <input
                  value={draft.city ?? ""}
                  onChange={set("city")}
                  className={inputClass("city")}
                />
              </AdminField>
            </div>
            {o.notes && (
              <p className="mt-4 rounded-2xl border border-glass-border bg-glass-soft p-4 text-sm">
                <strong className="block text-xs uppercase text-foreground/55">
                  Customer note
                </strong>
                {o.notes}
              </p>
            )}
            <Button className="mt-4" size="small" disabled={save.isPending} onClick={saveCustomer}>
              Save customer details
            </Button>
          </section>
        </div>

        <div className="space-y-5">
          <section className={adminCard}>
            <h2 className="font-display text-lg font-semibold">
              {o.fulfilment === "pickup" ? "Pickup progress" : "Delivery progress"}
            </h2>
            <div className="mt-4">
              <OrderTimeline order={o} forAdmin />
            </div>
            {advanceTo && (
              <Button
                className="mt-5 w-full"
                disabled={save.isPending}
                onClick={() => save.mutate({ status: advanceTo })}
              >
                {nextActionLabel(o.status, o.fulfilment)}
              </Button>
            )}
            {o.status === "pending" && (
              <p className="mt-4 rounded-2xl border border-glass-border bg-glass-soft p-3 text-xs text-foreground/65">
                Waiting for Paystack. The order moves to Paid on its own once the customer pays.
              </p>
            )}
          </section>

          <section className={adminCard}>
            <h2 className="font-display text-lg font-semibold">Status</h2>
            <p className="mt-1 text-xs text-foreground/55">
              Use this to correct or cancel an order. Normal progress uses the button above.
            </p>
            <select
              value={draft.status}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, status: e.target.value as OrderStatus } : d))
              }
              className={`${adminInput} mt-3`}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s, o.fulfilment)}
                </option>
              ))}
            </select>
            <AdminField label="Delivery fee (₦)" error={errors["delivery_fee"]} className="mt-3">
              <input
                type="number"
                min={0}
                value={draft.delivery_fee / 100}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, delivery_fee: Math.round(Number(e.target.value) * 100) || 0 } : d,
                  )
                }
                className={inputClass("delivery_fee")}
              />
            </AdminField>
            <AdminField label="Internal notes" error={errors["admin_notes"]} className="mt-3">
              <textarea
                value={draft.admin_notes ?? ""}
                onChange={set("admin_notes")}
                rows={4}
                className={inputClass("admin_notes")}
                placeholder="Waybill number, rider details…"
              />
            </AdminField>
            <Button className="mt-4 w-full" disabled={save.isPending} onClick={saveStatus}>
              Update order
            </Button>
            <p className="mt-2 text-xs text-foreground/55">
              Changing the delivery fee recalculates the recorded total; it doesn't charge the
              customer again.
            </p>
          </section>

          {o.paystack_payload && (
            <section className={adminCard}>
              <h2 className="font-display text-lg font-semibold">Paystack</h2>
              <dl className="mt-3 space-y-1 text-sm">
                {(["status", "channel", "gateway_response", "paid_at"] as const).map((key) =>
                  o.paystack_payload?.[key] ? (
                    <div key={key} className="flex justify-between gap-3">
                      <dt className="text-foreground/60">{titleCase(key)}</dt>
                      <dd className="font-medium">{String(o.paystack_payload[key])}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`mt-3 block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-semibold uppercase text-foreground/55">{label}</span>
      {children}
    </label>
  );
}
