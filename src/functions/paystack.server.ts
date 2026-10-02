import { pointsEarned, rewardsActive } from "@/lib/rewards";
import { getSupabaseAdmin, serverEnv } from "@/lib/supabase.server";

export const PAYSTACK_API = "https://api.paystack.co";

export interface PaystackVerifyData {
  status: string;
  /** Amount charged, including fees when the account passes charges to the customer. */
  amount: number;
  /** Amount we asked for at initialisation (excludes customer-borne fees). */
  requested_amount?: number;
  currency: string;
  reference: string;
  paid_at?: string;
  channel?: string;
}

/** Idempotently marks an order paid after checking amount/currency, and reduces stock once. */
export async function markOrderPaid(reference: string, tx: PaystackVerifyData) {
  const db = getSupabaseAdmin();
  const { data: order } = await db
    .from("orders")
    .select("id, total, status, admin_notes, user_id, subtotal, points_redeemed, points_discount")
    .eq("reference", reference)
    .maybeSingle();
  if (!order) return { ok: false as const, reason: "Order not found" };
  if (order.status !== "pending" && order.status !== "failed")
    return { ok: true as const, orderId: order.id as string };

  if (tx.status !== "success") {
    await db.from("orders").update({ status: "failed", paystack_payload: tx }).eq("id", order.id);
    return { ok: false as const, reason: "Payment was not successful" };
  }
  // Compare against the requested amount: with "pass charges to customer" enabled on the
  // Paystack account, `amount` also includes Paystack's fee.
  const paidForOrder = tx.requested_amount ?? tx.amount;
  if (paidForOrder !== order.total || tx.currency !== "NGN") {
    await db
      .from("orders")
      .update({ admin_notes: "Amount mismatch on Paystack verification", paystack_payload: tx })
      .eq("id", order.id);
    return { ok: false as const, reason: "Payment amount mismatch" };
  }

  // Guard against double-processing (webhook + callback racing): only one update flips pending → paid.
  const { data: updated } = await db
    .from("orders")
    .update({
      status: "paid",
      paid_at: tx.paid_at ?? new Date().toISOString(),
      paystack_payload: tx,
      ...(order.admin_notes === "Amount mismatch on Paystack verification"
        ? { admin_notes: null }
        : {}),
    })
    .eq("id", order.id)
    .in("status", ["pending", "failed"])
    .select("id");
  if (updated && updated.length > 0) {
    const { data: items } = await db
      .from("order_items")
      .select("variant_id, quantity")
      .eq("order_id", order.id);
    for (const item of items ?? []) {
      if (item.variant_id)
        await db.rpc("decrement_stock", { _variant_id: item.variant_id, _qty: item.quantity });
    }
    await settleRewards(order);
  }
  return { ok: true as const, orderId: order.id as string };
}

/**
 * Points for a newly paid order: record points spent, and credit points earned on what the
 * customer paid for products. Runs once (only after pending → paid); the ledger's unique
 * (order_id, reason) index also blocks doubles. Never fails the payment itself.
 */
async function settleRewards(order: {
  id: string;
  user_id: string | null;
  subtotal: number;
  points_redeemed: number | null;
  points_discount: number | null;
}) {
  if (!order.user_id) return;
  const db = getSupabaseAdmin();
  try {
    if ((order.points_redeemed ?? 0) > 0) {
      await db.from("reward_ledger").insert({
        user_id: order.user_id,
        order_id: order.id,
        points: -(order.points_redeemed ?? 0),
        reason: "redeemed",
      });
    }
    const { data: settings } = await db
      .from("settings")
      .select("rewards_enabled, reward_spend_per_point, reward_point_value")
      .eq("id", 1)
      .maybeSingle();
    if (!rewardsActive(settings)) return;
    const earned = pointsEarned(order.subtotal - (order.points_discount ?? 0), settings);
    if (earned <= 0) return;
    const { error } = await db.from("reward_ledger").insert({
      user_id: order.user_id,
      order_id: order.id,
      points: earned,
      reason: "earned",
    });
    if (!error) await db.from("orders").update({ points_earned: earned }).eq("id", order.id);
  } catch (error) {
    console.error("Rewards not settled for order", order.id, error);
  }
}

export async function fetchPaystackTransaction(reference: string) {
  const response = await fetch(
    `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${serverEnv("PAYSTACK_SECRET_KEY")}` },
    },
  );
  const body = (await response.json()) as {
    status: boolean;
    message: string;
    data?: PaystackVerifyData;
  };
  if (!body.status || !body.data) throw new Error(body.message || "Could not verify payment");
  return body.data;
}

/** Verify Paystack's x-paystack-signature header (HMAC-SHA512 of the raw body with the secret key). */
export async function isValidPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(serverEnv("PAYSTACK_SECRET_KEY")),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
  if (hex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}
