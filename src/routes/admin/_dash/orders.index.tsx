import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useState } from "react";

import {
  adminCard,
  AdminPageHeader,
  ErrorNote,
  Loading,
  Pill,
  SearchInput,
  td,
  th,
} from "@/components/admin/ui";
import { OrderStatusBadge } from "@/components/site/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate, formatNaira, titleCase } from "@/lib/format";
import { supabase, unwrap } from "@/lib/supabase";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/_dash/orders/")({
  component: OrdersList,
});

const PAGE = 25;

function OrdersList() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const orders = useQuery({
    queryKey: ["admin", "orders", status, search, page],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE, page * PAGE + PAGE - 1);
      if (status) query = query.eq("status", status);
      const term = search.trim().replace(/[%,()]/g, "");
      if (term)
        query = query.or(
          `reference.ilike.%${term}%,full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`,
        );
      const result = await query;
      return { rows: unwrap<Order[]>(result), count: result.count ?? 0 };
    },
  });

  const exportCsv = () => {
    const rows = orders.data?.rows ?? [];
    const header = [
      "reference",
      "date",
      "customer",
      "email",
      "phone",
      "fulfilment",
      "state",
      "status",
      "subtotal",
      "delivery_fee",
      "total",
    ];
    const lines = rows.map((o) =>
      [
        o.reference,
        o.created_at,
        o.full_name,
        o.email,
        o.phone,
        o.fulfilment,
        o.state ?? "",
        o.status,
        o.subtotal / 100,
        o.delivery_fee / 100,
        o.total / 100,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sussflow-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const total = orders.data?.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description={`${total} order${total === 1 ? "" : "s"}`}
        actions={
          <Button variant="glass" onClick={exportCsv} disabled={!orders.data?.rows.length}>
            <Download className="size-4" /> Export CSV
          </Button>
        }
      />
      <div className={adminCard}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(0);
            }}
            placeholder="Reference, name, email, phone…"
          />
          <div className="flex flex-wrap gap-1.5">
            {(["", ...ORDER_STATUSES] as const).map((s) => (
              <button
                key={s || "all"}
                type="button"
                onClick={() => {
                  setStatus(s);
                  setPage(0);
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  status === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-glass-border bg-glass hover:text-brand",
                )}
              >
                {s ? titleCase(s) : "All"}
              </button>
            ))}
          </div>
        </div>
        <ErrorNote error={orders.error} />
        {orders.isLoading ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className={th}>Order</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Fulfilment</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {orders.data?.rows.map((order) => (
                  <tr key={order.id} className="hover:bg-glass-soft">
                    <td className={td}>
                      <Link
                        to="/admin/orders/$id"
                        params={{ id: order.id }}
                        className="font-semibold hover:text-brand"
                      >
                        {order.reference}
                      </Link>
                      <span className="block text-xs text-foreground/55">
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                    <td className={td}>
                      <span className="block font-medium">{order.full_name}</span>
                      <span className="block text-xs text-foreground/55">
                        {order.email} · {order.phone}
                      </span>
                    </td>
                    <td className={td}>
                      {order.fulfilment === "pickup" ? (
                        <Pill tone="brand">Lagos pickup</Pill>
                      ) : (
                        <Pill>Delivery · {order.state ?? "—"}</Pill>
                      )}
                    </td>
                    <td className={td}>
                      <OrderStatusBadge status={order.status} fulfilment={order.fulfilment} />
                    </td>
                    <td className={`${td} text-right font-semibold`}>{formatNaira(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.data?.rows.length === 0 && (
              <p className="p-6 text-center text-sm text-foreground/60">No orders found.</p>
            )}
          </div>
        )}
        {pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-foreground/60">
              Page {page + 1} of {pages}
            </span>
            <div className="flex gap-2">
              <Button
                size="small"
                variant="glass"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                size="small"
                variant="glass"
                disabled={page + 1 >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
