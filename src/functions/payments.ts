import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { checkoutCustomerSchema } from "@/lib/validation";
import { getSupabaseAdmin, getUserFromToken, serverEnv } from "@/lib/supabase.server";
import { fetchPaystackTransaction, markOrderPaid, PAYSTACK_API } from "./paystack.server";

const checkoutSchema = z
  .object({
    accessToken: z.string().nullable(),
    items: z
      .array(z.object({ variantId: z.string().uuid(), quantity: z.number().int().min(1).max(100) }))
      .min(1)
      .max(50),
  })
  .and(checkoutCustomerSchema);

interface VariantRow {
  id: string;
  price: number;
  stock: number;
  is_active: boolean;
  length_label: string | null;
  pack_size: number;
  product_id: string;
  products: { name: string; is_active: boolean } | null;
}

function variantText(v: { length_label: string | null; pack_size: number }) {
  return (
    [v.length_label, v.pack_size > 1 ? `${v.pack_size}-in-1 pack` : null]
      .filter(Boolean)
      .join(" · ") || null
  );
}

function siteUrl() {
  return (process.env["SITE_URL"] ?? "http://localhost:8080").replace(/\/$/, "");
}

/**
 * Creates a pending order priced from the database (never from the client) and
 * initialises a Paystack transaction. Returns the hosted checkout URL.
 */
export const initCheckout = createServerFn({ method: "POST" })
  .validator((input: unknown) => checkoutSchema.parse(input))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const user = await getUserFromToken(data.accessToken);

    const ids = data.items.map((item) => item.variantId);
    const { data: variants, error } = await db
      .from("product_variants")
      .select(
        "id, price, stock, is_active, length_label, pack_size, product_id, products(name, is_active)",
      )
      .in("id", ids)
      .returns<VariantRow[]>();
    if (error) throw new Error(error.message);

    const lines = data.items.map((item) => {
      const variant = variants?.find((v) => v.id === item.variantId);
      if (!variant || !variant.is_active || !variant.products?.is_active) {
        throw new Error("An item in your bag is no longer available. Please review your bag.");
      }
      if (variant.stock < item.quantity) {
        throw new Error(
          `Only ${variant.stock} left of ${variant.products.name}${variantText(variant) ? ` (${variantText(variant)})` : ""}.`,
        );
      }
      return { variant, quantity: item.quantity };
    });

    const subtotal = lines.reduce((sum, line) => sum + line.variant.price * line.quantity, 0);

    const { data: settings } = await db.from("settings").select("*").eq("id", 1).maybeSingle();
    let deliveryFee = 0;
    if (data.fulfilment === "delivery" && settings) {
      const isLagos = (data.state ?? "").toLowerCase().includes("lagos");
      deliveryFee = isLagos ? settings.lagos_delivery_fee : settings.nationwide_delivery_fee;
      if (settings.free_delivery_threshold != null && subtotal >= settings.free_delivery_threshold)
        deliveryFee = 0;
    }
    const total = subtotal + deliveryFee;
    const reference = `SF-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

    const { data: order, error: orderError } = await db
      .from("orders")
      .insert({
        reference,
        user_id: user?.id ?? null,
        email: data.email,
        full_name: data.fullName,
        phone: data.phone,
        fulfilment: data.fulfilment,
        address: data.fulfilment === "delivery" ? data.address : null,
        city: data.fulfilment === "delivery" ? data.city : null,
        state: data.fulfilment === "delivery" ? data.state : "Lagos",
        notes: data.notes || null,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        status: "pending",
      })
      .select("id")
      .single();
    if (orderError || !order) throw new Error(orderError?.message ?? "Could not create order");

    const { error: itemsError } = await db.from("order_items").insert(
      lines.map((line) => ({
        order_id: order.id,
        product_id: line.variant.product_id,
        variant_id: line.variant.id,
        product_name: line.variant.products?.name ?? "Product",
        variant_label: variantText(line.variant),
        unit_price: line.variant.price,
        quantity: line.quantity,
      })),
    );
    if (itemsError) throw new Error(itemsError.message);

    const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serverEnv("PAYSTACK_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        amount: total,
        currency: "NGN",
        reference,
        callback_url: `${siteUrl()}/checkout/callback`,
        metadata: {
          order_id: order.id,
          customer_name: data.fullName,
          phone: data.phone,
        },
      }),
    });
    const body = (await response.json()) as {
      status: boolean;
      message: string;
      data?: { authorization_url: string };
    };
    if (!response.ok || !body.status || !body.data) {
      await db
        .from("orders")
        .update({ status: "failed", admin_notes: `Paystack init failed: ${body.message}` })
        .eq("id", order.id);
      throw new Error(`Payment could not be started: ${body.message}`);
    }

    return { reference, authorizationUrl: body.data.authorization_url };
  });

export const verifyPayment = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ reference: z.string().min(3).max(100) }).parse(input))
  .handler(async ({ data }) => {
    const tx = await fetchPaystackTransaction(data.reference);
    const result = await markOrderPaid(data.reference, tx);
    const { data: order } = await getSupabaseAdmin()
      .from("orders")
      .select(
        "reference, full_name, email, total, status, fulfilment, order_items(product_name, variant_label, quantity, unit_price)",
      )
      .eq("reference", data.reference)
      .maybeSingle();
    return { ok: result.ok, reason: result.ok ? null : result.reason, order };
  });
