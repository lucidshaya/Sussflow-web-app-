import { createServerFn } from "@tanstack/react-start";

import { getSupabaseAdmin } from "@/lib/supabase.server";
import { reviewSchema } from "@/lib/validation";

/** Saves a product review for admin approval (Admin → Reviews); it isn't public until approved. */
export const submitReview = createServerFn({ method: "POST" })
  .validator((input: unknown) => reviewSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true }; // honeypot: pretend it worked
    const db = getSupabaseAdmin();
    const { data: product } = await db
      .from("products")
      .select("id")
      .eq("id", data.productId)
      .eq("is_active", true)
      .maybeSingle();
    if (!product) throw new Error("This product isn't available for reviews.");
    // Light flood guard: one review per name per product every 10 minutes.
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await db
      .from("product_reviews")
      .select("id", { count: "exact", head: true })
      .eq("product_id", data.productId)
      .ilike("name", data.name)
      .gte("created_at", since);
    if ((count ?? 0) > 0) return { ok: true };
    const { error } = await db.from("product_reviews").insert({
      product_id: data.productId,
      name: data.name,
      rating: data.rating,
      comment: data.comment,
    });
    if (error) throw new Error("We couldn't save your review. Please try again.");
    return { ok: true };
  });
