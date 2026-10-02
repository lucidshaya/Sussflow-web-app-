import { createServerFn } from "@tanstack/react-start";

import { getSupabaseAdmin } from "@/lib/supabase.server";
import type { Fulfilment, OrderStatus } from "@/lib/types";
import { trackOrderSchema } from "@/lib/validation";

export interface TrackedOrder {
  reference: string;
  status: OrderStatus;
  fulfilment: Fulfilment;
  created_at: string;
  paid_at: string | null;
  processing_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  subtotal: number;
  delivery_fee: number;
  points_discount: number;
  total: number;
  city: string | null;
  state: string | null;
  delivery_area: string | null;
  items: {
    product_name: string;
    variant_label: string | null;
    quantity: number;
    unit_price: number;
  }[];
}

/**
 * Lets guests follow an order without an account. Both the order number and the
 * checkout email must match, and only progress details are returned (no phone or street address).
 */
export const trackOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) => trackOrderSchema.parse(input))
  .handler(async ({ data }): Promise<TrackedOrder> => {
    const { data: order } = await getSupabaseAdmin()
      .from("orders")
      .select("*, order_items(product_name, variant_label, quantity, unit_price)")
      .eq("reference", data.reference)
      // Case-insensitive exact match: escape LIKE wildcards such as "_" in the address.
      .ilike("email", data.email.replace(/[\\%_]/g, "\\$&"))
      .maybeSingle();
    if (!order) {
      throw new Error("We couldn't find an order with that number and email. Check your receipt.");
    }
    // Timeline stamps come from the 0003 migration; treat them as empty until it runs.
    const stamp = (key: string) => (order[key] as string | null | undefined) ?? null;
    return {
      reference: order.reference,
      status: order.status,
      fulfilment: order.fulfilment,
      created_at: order.created_at,
      paid_at: order.paid_at,
      processing_at: stamp("processing_at"),
      shipped_at: stamp("shipped_at"),
      delivered_at: stamp("delivered_at"),
      cancelled_at: stamp("cancelled_at"),
      subtotal: order.subtotal,
      delivery_fee: order.delivery_fee,
      points_discount: order.points_discount ?? 0,
      total: order.total,
      city: order.city,
      state: order.state,
      delivery_area: order.delivery_area ?? null,
      items: order.order_items ?? [],
    };
  });
