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
    .select("id, total, status, admin_notes")
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
  }
  return { ok: true as const, orderId: order.id as string };
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
