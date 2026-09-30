import { Check, CircleSlash } from "lucide-react";

import { formatDate } from "@/lib/format";
import { orderTimeline, statusLabel } from "@/lib/order-flow";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Vertical progress tracker for an order. Customers see what happens next;
 * admins (`forAdmin`) also see what they need to do to reach each step.
 */
export function OrderTimeline({ order, forAdmin = false }: { order: Order; forAdmin?: boolean }) {
  const steps = orderTimeline(order);
  const stopped = order.status === "cancelled" || order.status === "failed";

  return (
    <ol className="relative">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1 && !stopped;
        return (
          <li key={step.status} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 rounded-full",
                  step.state === "done" && steps[i + 1]?.state === "done"
                    ? "bg-leaf"
                    : "bg-foreground/10",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-semibold",
                step.state === "done" && "border-leaf bg-leaf text-white",
                step.state === "current" &&
                  "border-brand bg-primary-foreground text-brand ring-4 ring-brand/15",
                step.state === "upcoming" &&
                  "border-foreground/15 bg-primary-foreground text-foreground/40",
              )}
            >
              {step.state === "done" ? <Check className="size-4" strokeWidth={3} /> : i + 1}
            </span>
            <div className="min-w-0 pt-1">
              <p
                className={cn(
                  "font-semibold leading-tight",
                  step.state === "upcoming" && "text-foreground/45",
                )}
              >
                {step.title}
                {step.state === "current" && (
                  <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 align-middle text-[11px] font-semibold text-brand">
                    {forAdmin ? "Next step" : "Up next"}
                  </span>
                )}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-sm",
                  step.state === "upcoming" ? "text-foreground/40" : "text-foreground/65",
                )}
              >
                {forAdmin && step.state !== "done" ? step.action : step.detail}
              </p>
              {step.state === "done" && step.at && (
                <p className="mt-0.5 text-xs text-foreground/50">{formatDate(step.at)}</p>
              )}
            </div>
          </li>
        );
      })}
      {stopped && (
        <li className="relative flex gap-4">
          <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 border-alert bg-alert text-white">
            <CircleSlash className="size-4" />
          </span>
          <div className="pt-1">
            <p className="font-semibold leading-tight text-alert">
              {statusLabel(order.status, order.fulfilment)}
            </p>
            <p className="mt-0.5 text-sm text-foreground/65">
              {order.status === "failed"
                ? "The payment didn't go through, so this order won't be fulfilled."
                : "This order was cancelled and won't be fulfilled."}
            </p>
            {order.cancelled_at && (
              <p className="mt-0.5 text-xs text-foreground/50">{formatDate(order.cancelled_at)}</p>
            )}
          </div>
        </li>
      )}
    </ol>
  );
}
