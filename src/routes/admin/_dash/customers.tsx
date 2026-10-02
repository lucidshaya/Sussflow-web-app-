import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AdminField,
  adminInvalid,
  adminCard,
  adminInput,
  AdminPageHeader,
  ErrorNote,
  Loading,
  Pill,
  SearchInput,
  td,
  th,
} from "@/components/admin/ui";
import { AdjustPoints } from "@/components/admin/AdjustPoints";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatDate, formatNaira } from "@/lib/format";
import { supabase, unwrap } from "@/lib/supabase";
import type { Order, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { profileSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";

export const Route = createFileRoute("/admin/_dash/customers")({
  component: Customers,
});

interface CustomerRow {
  key: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  profile: Profile | null;
  orders: number;
  spent: number;
  lastOrder: string | null;
}

const PAID = new Set(["paid", "processing", "shipped", "delivered"]);

function Customers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Profile | null>(null);

  const data = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const [profiles, orders, ledger] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("email, full_name, phone, state, status, total, created_at, user_id"),
        supabase.from("reward_ledger").select("user_id, points"),
      ]);
      // Points balance per account (empty before migration 0008).
      const points: Record<string, number> = {};
      for (const row of (ledger.data ?? []) as { user_id: string; points: number }[])
        points[row.user_id] = (points[row.user_id] ?? 0) + row.points;
      return {
        points,
        profiles: unwrap<Profile[]>(profiles),
        orders:
          unwrap<
            Pick<
              Order,
              | "email"
              | "full_name"
              | "phone"
              | "state"
              | "status"
              | "total"
              | "created_at"
              | "user_id"
            >[]
          >(orders),
      };
    },
  });

  const rows: CustomerRow[] = [];
  if (data.data) {
    const byEmail = new Map<string, CustomerRow>();
    for (const profile of data.data.profiles) {
      const email = (profile.email ?? "").toLowerCase();
      byEmail.set(email || profile.id, {
        key: profile.id,
        name: profile.full_name || "—",
        email: profile.email ?? "",
        phone: profile.phone,
        location: [profile.city, profile.state].filter(Boolean).join(", ") || null,
        profile,
        orders: 0,
        spent: 0,
        lastOrder: null,
      });
    }
    for (const order of data.data.orders) {
      const email = order.email.toLowerCase();
      const row =
        byEmail.get(email) ??
        ({
          key: email,
          name: order.full_name,
          email: order.email,
          phone: order.phone,
          location: order.state,
          profile: null,
          orders: 0,
          spent: 0,
          lastOrder: null,
        } satisfies CustomerRow);
      row.orders += 1;
      if (PAID.has(order.status)) row.spent += order.total;
      if (!row.lastOrder || order.created_at > row.lastOrder) row.lastOrder = order.created_at;
      row.phone ??= order.phone;
      byEmail.set(email, row);
    }
    rows.push(...byEmail.values());
    rows.sort((a, b) => (b.lastOrder ?? "").localeCompare(a.lastOrder ?? ""));
  }
  const filtered = rows.filter((r) =>
    `${r.name} ${r.email} ${r.phone ?? ""}`.toLowerCase().includes(search.toLowerCase()),
  );

  const [errors, setErrors] = useState<FieldErrors>({});

  const saveProfile = async (profile: Profile) => {
    const result = profileSchema.safeParse({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      city: profile.city ?? "",
      state: profile.state ?? "",
    });
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    setErrors({});
    const v = result.data;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: v.full_name,
        phone: v.phone ?? null,
        address: v.address ?? null,
        city: v.city ?? null,
        state: v.state ?? null,
      })
      .eq("id", profile.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Customer updated");
    setEditing(null);
    void queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
  };

  return (
    <>
      <AdminPageHeader
        title="Customers"
        description={`${rows.length} customers · registered accounts and guest checkouts`}
        actions={<SearchInput value={search} onChange={setSearch} />}
      />
      <div className={adminCard}>
        <ErrorNote error={data.error} />
        {data.isLoading ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className={th}>Customer</th>
                  <th className={th}>Phone</th>
                  <th className={th}>Location</th>
                  <th className={th}>Type</th>
                  <th className={th}>Orders</th>
                  <th className={th}>Spent</th>
                  <th className={th}>Last order</th>
                  <th className={th}>Points</th>
                  <th className={`${th} text-right`}>Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {filtered.map((row) => (
                  <tr key={row.key} className="hover:bg-glass-soft">
                    <td className={td}>
                      <span className="block font-semibold">{row.name}</span>
                      <a
                        href={`mailto:${row.email}`}
                        className="text-xs text-foreground/55 hover:text-brand"
                      >
                        {row.email}
                      </a>
                    </td>
                    <td className={td}>{row.phone ?? "—"}</td>
                    <td className={td}>{row.location ?? "—"}</td>
                    <td className={td}>
                      {row.profile ? <Pill tone="brand">Account</Pill> : <Pill>Guest</Pill>}
                    </td>
                    <td className={td}>{row.orders}</td>
                    <td className={`${td} font-semibold`}>{formatNaira(row.spent)}</td>
                    <td className={td}>{row.lastOrder ? formatDate(row.lastOrder) : "—"}</td>
                    <td className={td}>
                      {row.profile ? (
                        <AdjustPoints
                          userId={row.profile.id}
                          name={row.name && row.name !== "—" ? row.name : row.email}
                          balance={data.data?.points[row.profile.id] ?? 0}
                          onDone={() =>
                            void queryClient.invalidateQueries({ queryKey: ["admin", "customers"] })
                          }
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className={`${td} text-right`}>
                      {row.profile && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9"
                          onClick={() => setEditing(row.profile)}
                          aria-label={`Edit ${row.name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="p-6 text-center text-sm text-foreground/60">No customers yet.</p>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setErrors({});
          }
        }}
      >
        <DialogContent className="rounded-[28px] border-glass-border bg-background/95 backdrop-blur-2xl">
          <DialogTitle className="font-display text-xl">Edit customer</DialogTitle>
          {editing && (
            <form
              noValidate
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void saveProfile(editing);
              }}
            >
              {(
                [
                  ["full_name", "Full name"],
                  ["phone", "Phone"],
                  ["address", "Address"],
                  ["city", "City"],
                  ["state", "State"],
                ] as const
              ).map(([key, label]) => (
                <AdminField
                  key={key}
                  label={label}
                  error={errors[key]}
                  hint={key === "phone" ? "At least 9 digits" : undefined}
                >
                  <input
                    value={editing[key] ?? ""}
                    type={key === "phone" ? "tel" : "text"}
                    onChange={(e) => {
                      setEditing({ ...editing, [key]: e.target.value || null });
                      if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
                    }}
                    className={cn(adminInput, errors[key] && adminInvalid)}
                  />
                </AdminField>
              ))}
              <Button type="submit" className="w-full">
                Save
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
