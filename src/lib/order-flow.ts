import type { Fulfilment, Order, OrderStatus } from "./types";

// One status enum drives both delivery and pickup orders; only the words differ.
// pending → paid → processing → shipped → delivered  (cancelled / failed end the flow)

export const FLOW = ["pending", "paid", "processing", "shipped", "delivered"] as const;
type FlowStatus = (typeof FLOW)[number];
const inFlow = (status: OrderStatus): status is FlowStatus =>
  (FLOW as readonly OrderStatus[]).includes(status);

const LABELS: Record<Fulfilment, Record<OrderStatus, string>> = {
  delivery: {
    pending: "Awaiting payment",
    paid: "Paid",
    processing: "Packing",
    shipped: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    failed: "Payment failed",
  },
  pickup: {
    pending: "Awaiting payment",
    paid: "Paid",
    processing: "Packing",
    shipped: "Ready for pickup",
    delivered: "Picked up",
    cancelled: "Cancelled",
    failed: "Payment failed",
  },
};

export function statusLabel(status: OrderStatus, fulfilment: Fulfilment = "delivery") {
  return LABELS[fulfilment][status];
}

interface StepCopy {
  title: string;
  /** What the customer sees for this step. */
  detail: string;
  /** What the admin should do to reach this step. */
  action: string;
}

const STEPS: Record<Fulfilment, Record<FlowStatus, StepCopy>> = {
  delivery: {
    pending: {
      title: "Order placed",
      detail: "We've received your order.",
      action: "Created automatically at checkout.",
    },
    paid: {
      title: "Payment confirmed",
      detail: "Paystack confirmed your payment.",
      action: "Set automatically when Paystack confirms payment.",
    },
    processing: {
      title: "Packing your order",
      detail: "We're getting your items ready.",
      action: "Mark as packing when you start preparing the parcel.",
    },
    shipped: {
      title: "Out for delivery",
      detail: "Your parcel is with our dispatch rider or courier.",
      action: "Hand the parcel to the rider or courier, then add the waybill in the notes.",
    },
    delivered: {
      title: "Delivered",
      detail: "Your order has arrived. Enjoy!",
      action: "Mark as delivered once the customer receives it.",
    },
  },
  pickup: {
    pending: {
      title: "Order placed",
      detail: "We've received your order.",
      action: "Created automatically at checkout.",
    },
    paid: {
      title: "Payment confirmed",
      detail: "Paystack confirmed your payment.",
      action: "Set automatically when Paystack confirms payment.",
    },
    processing: {
      title: "Packing your order",
      detail: "We're getting your items ready.",
      action: "Mark as packing when you start preparing the order.",
    },
    shipped: {
      title: "Ready for pickup",
      detail: "Your order is waiting for you at our Lagos pickup point.",
      action: "Mark ready, then call or WhatsApp the customer to arrange pickup.",
    },
    delivered: {
      title: "Picked up",
      detail: "You've collected your order. Enjoy!",
      action: "Mark as picked up when the customer collects it.",
    },
  },
};

export type StepState = "done" | "current" | "upcoming";

export interface TimelineStep extends StepCopy {
  status: OrderStatus;
  state: StepState;
  at: string | null | undefined;
}

const STAMP: Record<FlowStatus, keyof Order> = {
  pending: "created_at",
  paid: "paid_at",
  processing: "processing_at",
  shipped: "shipped_at",
  delivered: "delivered_at",
};

/** The five fulfilment steps: reached steps are done, the next one is current. */
export function orderTimeline(order: Order): TimelineStep[] {
  const reached = inFlow(order.status) ? FLOW.indexOf(order.status) : -1;
  const ended = reached < 0;
  // A cancelled/failed order keeps the steps it had reached before it stopped.
  const upTo = ended ? FLOW.reduce((last, s, i) => (order[STAMP[s]] ? i : last), 0) : reached;
  return FLOW.map((status, i) => ({
    status,
    ...STEPS[order.fulfilment][status],
    at: order[STAMP[status]] as string | null | undefined,
    state: i <= upTo ? "done" : !ended && i === upTo + 1 ? "current" : "upcoming",
  }));
}

/** The status an admin would move this order to next, if any. */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  // Pending orders only become paid through Paystack verification.
  if (status === "pending" || status === "cancelled" || status === "failed") return null;
  if (!inFlow(status)) return null;
  return FLOW[FLOW.indexOf(status) + 1] ?? null;
}

export function nextActionLabel(status: OrderStatus, fulfilment: Fulfilment) {
  const next = nextStatus(status);
  if (!next) return null;
  const words: Record<Fulfilment, Partial<Record<OrderStatus, string>>> = {
    delivery: {
      processing: "Start packing",
      shipped: "Mark out for delivery",
      delivered: "Mark as delivered",
    },
    pickup: {
      processing: "Start packing",
      shipped: "Mark ready for pickup",
      delivered: "Mark as picked up",
    },
  };
  return words[fulfilment][next] ?? null;
}
