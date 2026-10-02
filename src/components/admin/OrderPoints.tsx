import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Gift, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/lib/types";

/** Points spent/earned on an order; for cancelled orders, a one-time "Reverse points". */
export function OrderPoints({
  order,
}: {
  order: Pick<
    Order,
    "id" | "user_id" | "status" | "points_redeemed" | "points_discount" | "points_earned"
  >;
}) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const redeemed = order.points_redeemed ?? 0;
  const earned = order.points_earned ?? 0;
  const reversed = useQuery({
    queryKey: ["admin", "order-points", order.id],
    enabled: Boolean(order.user_id) && (redeemed > 0 || earned > 0),
    queryFn: async () => {
      const { data } = await supabase
        .from("reward_ledger")
        .select("id")
        .eq("order_id", order.id)
        .eq("reason", "reversed");
      return (data ?? []).length > 0;
    },
  });
  if (!order.user_id || (redeemed === 0 && earned === 0)) return null;
  // Give back spent points, take back earned ones.
  const net = redeemed - earned;

  return (
    <div className="mt-3 rounded-xl border border-glass-border bg-glass-soft p-3 text-sm">
      <p className="flex items-center gap-1.5 font-semibold">
        <Gift className="size-4 text-brand" /> Points
      </p>
      <ul className="mt-1 space-y-0.5 text-foreground/70">
        {redeemed > 0 && (
          <li>
            Used {redeemed} points ({formatNaira(order.points_discount ?? 0)} off)
          </li>
        )}
        {earned > 0 && <li>Earned {earned} points</li>}
      </ul>
      {order.status === "cancelled" &&
        (reversed.data ? (
          <p className="mt-2 text-xs font-semibold text-leaf">Points reversed.</p>
        ) : (
          net !== 0 && (
            <Button
              size="small"
              variant="ghost"
              className="mt-2"
              disabled={busy || reversed.isLoading}
              onClick={async () => {
                setBusy(true);
                const { error } = await supabase.from("reward_ledger").insert({
                  user_id: order.user_id,
                  order_id: order.id,
                  points: net,
                  reason: "reversed",
                  note: "Order cancelled",
                });
                setBusy(false);
                if (error) {
                  toast.error(error.message);
                  return;
                }
                toast.success("Points reversed");
                void queryClient.invalidateQueries({ queryKey: ["admin"] });
              }}
            >
              {busy && <Loader2 className="size-4 animate-spin" />} Reverse points (
              {net > 0 ? `return ${net}` : `remove ${-net}`})
            </Button>
          )
        ))}
    </div>
  );
}
