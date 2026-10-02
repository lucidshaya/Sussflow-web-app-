import { useQuery } from "@tanstack/react-query";
import { Gift } from "lucide-react";

import { formatNaira } from "@/lib/format";
import { rewardLedgerQuery, settingsQuery } from "@/lib/queries";
import { pointsValue, rewardsActive, rewardsSummary } from "@/lib/rewards";

import { glassCard } from "./primitives";

const REASONS = {
  earned: "Earned on order",
  redeemed: "Used on order",
  reversed: "Reversed (cancelled order)",
  adjustment: "Adjustment",
} as const;

/** "My points" on the account page: balance, value and history. */
export function MyPoints({ userId }: { userId: string }) {
  const { data: settings } = useQuery(settingsQuery);
  const ledger = useQuery(rewardLedgerQuery(userId));
  if (!rewardsActive(settings)) return null;
  const rows = ledger.data ?? [];
  const balance = rows.reduce((sum, row) => sum + row.points, 0);

  return (
    <section className="mx-auto max-w-7xl px-5 pt-8">
      <div className={`${glassCard} grid gap-5 p-6 md:grid-cols-[260px_1fr] md:p-8 [&>*]:min-w-0`}>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-brand">
            <Gift className="size-4" /> My points
          </p>
          <p className="mt-2 font-display text-4xl font-semibold">{balance}</p>
          <p className="text-sm text-foreground/65">
            worth {formatNaira(pointsValue(balance, settings))} off your next order
          </p>
          <p className="mt-3 text-xs leading-relaxed text-foreground/55">
            {rewardsSummary(settings)}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">History</p>
          {rows.length === 0 ? (
            <p className="mt-2 text-sm text-foreground/60">
              No points yet — you'll earn points on every paid order.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-foreground/10 text-sm">
              {rows.slice(0, 8).map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-2">
                  <span>
                    {REASONS[row.reason]}
                    {row.note && <span className="text-foreground/55"> · {row.note}</span>}
                    <span className="block text-xs text-foreground/45">
                      {new Date(row.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                  <span
                    className={
                      row.points > 0 ? "font-semibold text-leaf" : "font-semibold text-alert"
                    }
                  >
                    {row.points > 0 ? "+" : ""}
                    {row.points}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
