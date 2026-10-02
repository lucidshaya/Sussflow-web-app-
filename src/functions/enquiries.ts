import { createServerFn } from "@tanstack/react-start";

import { getSupabaseAdmin } from "@/lib/supabase.server";
import { enquirySchema, waitlistSchema } from "@/lib/validation";

const NEW_TYPE_LABELS: Record<string, string> = {
  stockist: "Stockist application",
  distributor: "Distributor application",
};

/** Session bookings, partnerships, stockist/distributor applications and contact messages. */
export const submitEnquiry = createServerFn({ method: "POST" })
  .validator((input: unknown) => enquirySchema.parse(input))
  .handler(async ({ data }) => {
    // Honeypot filled in: pretend it worked so bots don't retry.
    if (data.website) return { ok: true };
    const row = {
      type: data.type,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone ?? null,
      organisation: data.organisation ?? null,
      location: data.location ?? null,
      beneficiaries: data.beneficiaries ?? null,
      message: data.message ?? null,
    };
    const db = getSupabaseAdmin();
    let { error } = await db.from("enquiries").insert(row);
    // Before the 0005 migration adds the stockist/distributor types, file them as partnerships.
    const label = NEW_TYPE_LABELS[data.type];
    if (error && label && error.code === "22P02") {
      ({ error } = await db.from("enquiries").insert({
        ...row,
        type: "partnership",
        message: `[${label}] ${row.message ?? ""}`.trim(),
      }));
    }
    if (error) throw new Error("We couldn't send your message. Please try again.");
    return { ok: true };
  });

export const joinWaitlist = createServerFn({ method: "POST" })
  .validator((input: unknown) => waitlistSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true, alreadyJoined: false };
    const email = data.email.toLowerCase();
    const db = getSupabaseAdmin();
    // Joining again after unsubscribing from blog emails opts back in (table from 0007).
    await db.from("email_unsubscribes").delete().eq("email", email);
    const { data: existing } = await db
      .from("enquiries")
      .select("id")
      .eq("type", "waitlist")
      .eq("email", email)
      .maybeSingle();
    if (existing) return { ok: true, alreadyJoined: true };
    const { error } = await db.from("enquiries").insert({
      type: "waitlist",
      name: email.split("@")[0] ?? "Waitlist",
      email,
      message: "Email list sign-up (deals, tips & new stores)",
    });
    if (error) throw new Error("We couldn't add you right now. Please try again.");
    return { ok: true, alreadyJoined: false };
  });
