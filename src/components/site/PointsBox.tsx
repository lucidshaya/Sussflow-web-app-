import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Gift } from "lucide-react";

import { formatNaira } from "@/lib/format";
import { rewardLedgerQuery } from "@/lib/queries";
import { maxRedeemable, pointsEarned, pointsValue, type RewardSettings } from "@/lib/rewards";
import { cn } from "@/lib/utils";

/** Checkout points box: balance + "use my points" for members, a sign-in nudge for guests. */
export function PointsBox({
  settings,
  userId,
  subtotal,
  usePoints,
  onUsePointsChange,
  className,
}: {
  settings: RewardSettings;
  userId: string | undefined;
  subtotal: number;
  usePoints: boolean;
  onUsePointsChange: (use: boolean) => void;
  className?: string;
}) {
  const ledger = useQuery(rewardLedgerQuery(userId));
  const balance = (ledger.data ?? []).reduce((sum, row) => sum + row.points, 0);
  const usable = maxRedeemable(balance, subtotal, settings);
  const discount = usePoints ? pointsValue(usable, settings) : 0;
  const willEarn = pointsEarned(subtotal - discount, settings);

  return (
    <div
      className={cn("rounded-2xl border border-glass-border bg-glass-soft p-3 text-sm", className)}
    >
      <p className="flex items-center gap-1.5 font-semibold">
        <Gift className="size-4 text-brand" /> Sussflow points
      </p>
      {!userId ? (
        <p className="mt-1 text-xs text-foreground/65">
          <Link to="/auth" className="font-semibold text-brand hover:underline">
            Sign in or create an account
          </Link>{" "}
          to earn {willEarn} points ({formatNaira(pointsValue(willEarn, settings))} off a future
          order) on this purchase.
        </p>
      ) : (
        <>
          <p className="mt-1 text-xs text-foreground/65">
            You have <strong>{balance}</strong> points (
            {formatNaira(pointsValue(balance, settings))}
            ). You'll earn <strong>{willEarn}</strong> more with this order.
          </p>
          {usable > 0 && (
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={usePoints}
                onChange={(e) => onUsePointsChange(e.target.checked)}
                className="size-4 accent-[var(--color-brand)]"
              />
              Use {usable} points for {formatNaira(pointsValue(usable, settings))} off
            </label>
          )}
        </>
      )}
    </div>
  );
}

/** Points the checkout will send (the server re-checks the balance). */
export function usePointsToRedeem(
  settings: RewardSettings | null,
  userId: string | undefined,
  subtotal: number,
  usePoints: boolean,
) {
  const ledger = useQuery(rewardLedgerQuery(userId));
  if (!settings || !userId || !usePoints) return 0;
  const balance = (ledger.data ?? []).reduce((sum, row) => sum + row.points, 0);
  return maxRedeemable(balance, subtotal, settings);
}
