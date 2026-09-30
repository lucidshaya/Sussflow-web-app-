import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Inbox, Package, Receipt, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  adminCard,
  AdminPageHeader,
  ErrorNote,
  Loading,
  Pill,
  td,
  th,
} from "@/components/admin/ui";
import { OrderStatusBadge } from "@/components/site/OrderStatusBadge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatDate, formatNaira, variantLabel } from "@/lib/format";
import { supabase, unwrap } from "@/lib/supabase";
import type { Order, OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/_dash/")({
  component: Overview,
});

const PAID: OrderStatus[] = ["paid", "processing", "shipped", "delivered"];
const chartConfig = { revenue: { label: "Revenue", color: "var(--brand)" } } satisfies ChartConfig;

interface LowStockRow {
  id: string;
  stock: number;
  length_label: string | null;
  pack_size: number;
  products: { id: string; name: string } | null;
}

function Overview() {
  const since = new Date(Date.now() - 29 * 86400000);
  since.setHours(0, 0, 0, 0);

  const orders = useQuery({
    queryKey: ["admin", "overview-orders"],
    queryFn: async () =>
      unwrap<Order[]>(
        await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1000),
      ),
  });
  const lowStock = useQuery({
    queryKey: ["admin", "low-stock"],
    queryFn: async () =>
      unwrap<LowStockRow[]>(
        await supabase
          .from("product_variants")
          .select("id, stock, length_label, pack_size, products(id, name)")
          .eq("is_active", true)
          .lte("stock", 5)
          .order("stock"),
      ),
  });
  const counts = useQuery({
    queryKey: ["admin", "counts"],
    queryFn: async () => {
      const [products, enquiries] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
      ]);
      return { products: products.count ?? 0, newEnquiries: enquiries.count ?? 0 };
    },
  });

  const all = orders.data ?? [];
  const paid = all.filter((o) => PAID.includes(o.status));
  const revenue = paid.reduce((sum, o) => sum + o.total, 0);
  const revenue30 = paid
    .filter((o) => new Date(o.paid_at ?? o.created_at) >= since)
    .reduce((sum, o) => sum + o.total, 0);
  const toFulfil = all.filter((o) => o.status === "paid" || o.status === "processing").length;

  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(since.getTime() + i * 86400000);
    return {
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
      revenue: 0,
    };
  });
  for (const o of paid) {
    const day = days.find((d) => d.key === (o.paid_at ?? o.created_at).slice(0, 10));
    if (day) day.revenue += o.total / 100;
  }

  const statusCounts = all.reduce<Record<string, number>>(
    (acc, o) => ({ ...acc, [o.status]: (acc[o.status] ?? 0) + 1 }),
    {},
  );

  return (
    <>
      <AdminPageHeader title="Overview" description="How Sussflow is doing today." />
      <ErrorNote error={orders.error} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={<Wallet className="size-5" />}
          label="Revenue (all time)"
          value={formatNaira(revenue)}
          sub={`${formatNaira(revenue30)} in the last 30 days`}
        />
        <Stat
          icon={<Receipt className="size-5" />}
          label="Paid orders"
          value={String(paid.length)}
          sub={`${toFulfil} waiting to be fulfilled`}
          link="/admin/orders"
        />
        <Stat
          icon={<Package className="size-5" />}
          label="Products"
          value={String(counts.data?.products ?? "–")}
          sub={`${lowStock.data?.length ?? 0} options low on stock`}
          link="/admin/products"
        />
        <Stat
          icon={<Inbox className="size-5" />}
          label="New enquiries"
          value={String(counts.data?.newEnquiries ?? "–")}
          sub="Sessions, partners & email list"
          link="/admin/enquiries"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className={adminCard}>
          <h2 className="font-display text-lg font-semibold">Revenue · last 30 days</h2>
          {orders.isLoading ? (
            <Loading />
          ) : (
            <ChartContainer config={chartConfig} className="mt-4 h-64 w-full">
              <BarChart data={days} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} strokeOpacity={0.3} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  width={60}
                  tickFormatter={(v: number) => `₦${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent formatter={(value) => formatNaira(Number(value) * 100)} />
                  }
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </section>
        <section className={adminCard}>
          <h2 className="font-display text-lg font-semibold">Orders by status</h2>
          <ul className="mt-4 space-y-2">
            {(
              [
                "pending",
                "paid",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
                "failed",
              ] as OrderStatus[]
            ).map((status) => (
              <li
                key={status}
                className="flex items-center justify-between rounded-2xl border border-glass-border bg-glass-soft px-4 py-2.5"
              >
                <OrderStatusBadge status={status} />
                <span className="font-semibold">{statusCounts[status] ?? 0}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className={adminCard}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-brand hover:underline">
              All orders →
            </Link>
          </div>
          {orders.isLoading ? (
            <Loading />
          ) : all.length === 0 ? (
            <p className="mt-4 text-sm text-foreground/60">
              No orders yet — they'll appear here as soon as customers check out.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-foreground/10">
                    <th className={th}>Reference</th>
                    <th className={th}>Customer</th>
                    <th className={th}>Status</th>
                    <th className={`${th} text-right`}>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  {all.slice(0, 8).map((order) => (
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
                      <td className={td}>{order.full_name}</td>
                      <td className={td}>
                        <OrderStatusBadge status={order.status} fulfilment={order.fulfilment} />
                      </td>
                      <td className={`${td} text-right font-semibold`}>
                        {formatNaira(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className={adminCard}>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <AlertTriangle className="size-4 text-alert" /> Low stock
            </h2>
            <Link
              to="/admin/price-list"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Restock →
            </Link>
          </div>
          {lowStock.isLoading ? (
            <Loading />
          ) : lowStock.data?.length ? (
            <ul className="mt-3 divide-y divide-foreground/5 text-sm">
              {lowStock.data.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span>
                    <span className="font-semibold">{row.products?.name}</span>
                    {variantLabel(row) && (
                      <span className="block text-xs text-foreground/55">{variantLabel(row)}</span>
                    )}
                  </span>
                  <Pill tone={row.stock === 0 ? "alert" : "brand"}>
                    {row.stock === 0 ? "Sold out" : `${row.stock} left`}
                  </Pill>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-foreground/60">Everything is well stocked.</p>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  link?: "/admin/orders" | "/admin/products" | "/admin/enquiries";
}) {
  const body = (
    <>
      <div className="flex items-center justify-between text-foreground/60">
        <span className="text-xs font-semibold uppercase">{label}</span>
        <span className="grid size-9 place-items-center rounded-full bg-lilac/40 text-brand">
          {icon}
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-foreground/55">{sub}</p>
    </>
  );
  return link ? (
    <Link to={link} className={`${adminCard} block transition-transform hover:-translate-y-0.5`}>
      {body}
    </Link>
  ) : (
    <div className={adminCard}>{body}</div>
  );
}
