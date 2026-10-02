import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { variantLabel } from "@/lib/format";
import { checkoutCustomerSchema } from "@/lib/validation";
import { getSupabaseAdmin, getUserFromToken, serverEnv } from "@/lib/supabase.server";
import { fetchPaystackTransaction, markOrderPaid, PAYSTACK_API } from "./paystack.server";
import { choicesError, choicesText, parseChoices } from "@/lib/choices";
import { deliveryFeeFor } from "@/lib/delivery";
import { maxRedeemable, pointsValue, rewardsActive } from "@/lib/rewards";

const checkoutSchema = z
  .object({
    accessToken: z.string().nullable(),
    items: z
      .array(
        z.object({
          variantId: z.string().uuid(),
          quantity: z.number().int().min(1).max(100),
          choices: z
            .record(z.string().max(60), z.string().max(60))
            .refine((c) => Object.keys(c).length <= 10)
            .optional(),
        }),
      )
      .min(1)
      .max(50),
    /** Points to spend (signed-in customers); capped on the server. */
    redeemPoints: z.number().int().min(0).max(10_000_000).optional(),
  })
  .and(checkoutCustomerSchema);

interface VariantRow {
  id: string;
  price: number;
  stock: number;
  is_active: boolean;
  length_label: string | null;
  size_label: string | null;
  pack_size: number;
  product_id: string;
  products: {
    name: string;
    slug: string;
    is_active: boolean;
    choices: unknown;
    show_size: boolean;
    show_length: boolean;
  } | null;
}

function variantText(v: VariantRow) {
  return variantLabel(v, v.products ?? undefined) || null;
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

    // Lines with the same variant (e.g. different colours) share its stock.
    const perVariant = new Map<string, number>();
    for (const item of data.items)
      perVariant.set(item.variantId, (perVariant.get(item.variantId) ?? 0) + item.quantity);
    const ids = [...perVariant.keys()];
    const { data: variants, error } = await db
      .from("product_variants")
      .select(
        "id, price, stock, is_active, length_label, size_label, pack_size, product_id, products(name, slug, is_active, choices, show_size, show_length)",
      )
      .in("id", ids)
      .returns<VariantRow[]>();
    if (error) throw new Error(error.message);

    const lines = data.items.map((item) => {
      const variant = variants?.find((v) => v.id === item.variantId);
      if (!variant || !variant.is_active || !variant.products?.is_active) {
        throw new Error("An item in your bag is no longer available. Please review your bag.");
      }
      const wanted = perVariant.get(variant.id) ?? item.quantity;
      if (variant.stock < wanted) {
        throw new Error(
          `Only ${variant.stock} left of ${variant.products.name}${variantText(variant) ? ` (${variantText(variant)})` : ""}.`,
        );
      }
      // Choices (flow type, colour…) must be ones the product offers; extras are dropped.
      const choices = parseChoices(variant.products.choices);
      const missing = choicesError(choices, item.choices);
      if (missing) throw new Error(`${missing} for ${variant.products.name}.`);
      const picked = Object.fromEntries(choices.map((c) => [c.name, item.choices![c.name]!]));
      const label = [variantText(variant), choicesText(picked, choices)]
        .filter(Boolean)
        .join(" · ");
      return { variant, quantity: item.quantity, label: label || null };
    });

    const subtotal = lines.reduce((sum, line) => sum + line.variant.price * line.quantity, 0);

    const { data: settings } = await db.from("settings").select("*").eq("id", 1).maybeSingle();
    // Same rule the checkout page shows (src/lib/delivery.ts), recomputed here from the DB.
    const deliveryFee = deliveryFeeFor(settings, {
      fulfilment: data.fulfilment,
      state: data.state,
    });
    // Points discount (signed-in customers only), re-checked against the real balance here.
    let pointsRedeemed = 0;
    let pointsDiscount = 0;
    if (user && data.redeemPoints && rewardsActive(settings)) {
      const { data: balance } = await db.rpc("reward_balance", { _user_id: user.id });
      pointsRedeemed = Math.min(
        data.redeemPoints,
        maxRedeemable(Number(balance ?? 0), subtotal, settings),
      );
      pointsDiscount = pointsValue(pointsRedeemed, settings);
    }
    const total = subtotal - pointsDiscount + deliveryFee;
    const reference = `SF-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;

    const { data: order, error: orderError } = await db
      .from("orders")
      .insert({
        reference,
        user_id: user?.id ?? null,
        email: data.email.toLowerCase(),
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
        ...(pointsRedeemed > 0 && {
          points_redeemed: pointsRedeemed,
          points_discount: pointsDiscount,
        }),
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
        variant_label: line.label,
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
  .validator((input: unknown) =>
    z
      .object({
        reference: z
          .string()
          .trim()
          .max(60)
          .regex(/^SF-[A-Z0-9]+-[A-Z0-9]+$/i),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const tx = await fetchPaystackTransaction(data.reference);
    const result = await markOrderPaid(data.reference, tx);
    const { data: order } = await getSupabaseAdmin()
      .from("orders")
      .select(
        "reference, email, subtotal, delivery_fee, total, points_discount, points_earned, status, fulfilment, order_items(product_name, variant_label, quantity, unit_price)",
      )
      .eq("reference", data.reference)
      .maybeSingle();
    return { ok: result.ok, reason: result.ok ? null : result.reason, order };
  });
