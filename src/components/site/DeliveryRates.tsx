import { useQuery } from "@tanstack/react-query";
import { Truck } from "lucide-react";

import { deliveryRates } from "@/lib/delivery";
import { settingsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

/** Current delivery and pickup prices, straight from Admin → Settings. */
export function DeliveryRates({ className }: { className?: string }) {
  const { data: settings } = useQuery(settingsQuery);
  const rates = deliveryRates(settings);
  if (!rates.length) return null;
  return (
    <div
      className={cn("rounded-2xl border border-glass-border bg-glass-soft p-3 text-xs", className)}
    >
      <p className="flex items-center gap-1.5 font-semibold">
        <Truck className="size-3.5 text-brand" /> Delivery & pickup
      </p>
      <dl className="mt-2 space-y-1">
        {rates.map((rate) => (
          <div key={rate.label} className="flex justify-between gap-3">
            <dt className="text-foreground/60">{rate.label}</dt>
            <dd className="text-right font-medium">{rate.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
