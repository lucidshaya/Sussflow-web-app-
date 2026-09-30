import { createServerFn } from "@tanstack/react-start";

import { getSupabaseAdmin } from "@/lib/supabase.server";
import { enquirySchema, waitlistSchema } from "@/lib/validation";

/** Session bookings, partnerships, contact messages and store waitlist — validated server-side. */
export const submitEnquiry = createServerFn({ method: "POST" })
  .validator((input: unknown) => enquirySchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await getSupabaseAdmin()
      .from("enquiries")
      .insert({
        type: data.type,
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone ?? null,
        organisation: data.organisation ?? null,
        location: data.location ?? null,
        beneficiaries: data.beneficiaries ?? null,
        message: data.message ?? null,
      });
    if (error) throw new Error("We couldn't send your message. Please try again.");
    return { ok: true };
  });

export const joinWaitlist = createServerFn({ method: "POST" })
  .validator((input: unknown) => waitlistSchema.parse(input))
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();
    const db = getSupabaseAdmin();
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
      message: "Footer waitlist sign-up",
    });
    if (error) throw new Error("We couldn't add you right now. Please try again.");
    return { ok: true, alreadyJoined: false };
  });
