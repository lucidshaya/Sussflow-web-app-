import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { assertAdmin, getSupabaseAdmin } from "@/lib/supabase.server";
import type { BlogPostRow } from "@/lib/types";

import {
  BATCH_SIZE,
  gmailConfigured,
  sendPostEmail,
  subscribers,
  validUnsubscribeToken,
} from "./newsletter.server";

const postInput = z.object({ accessToken: z.string().nullable(), postId: z.string().uuid() });

async function progress(postId: string) {
  const db = getSupabaseAdmin();
  const list = await subscribers();
  const { data: sent } = await db.from("newsletter_sends").select("email").eq("post_id", postId);
  const done = new Set((sent ?? []).map((r) => r.email as string));
  return { list, remaining: list.filter((email) => !done.has(email)), sentCount: done.size };
}

/** How many people would receive this article, and how many already have. */
export const newsletterStatus = createServerFn({ method: "POST" })
  .validator((input: unknown) => postInput.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.accessToken);
    const { list, remaining, sentCount } = await progress(data.postId);
    return {
      configured: gmailConfigured(),
      subscribers: list.length,
      remaining: remaining.length,
      sent: sentCount,
    };
  });

/** Emails the article to the next batch of subscribers; call repeatedly until remaining = 0. */
export const sendNewsletterBatch = createServerFn({ method: "POST" })
  .validator((input: unknown) => postInput.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.accessToken);
    if (!gmailConfigured())
      throw new Error("Email sending isn't set up yet (GMAIL_USER / GMAIL_APP_PASSWORD).");
    const db = getSupabaseAdmin();
    const { data: post } = await db
      .from("blog_posts")
      .select("*")
      .eq("id", data.postId)
      .maybeSingle<BlogPostRow>();
    if (!post) throw new Error("Article not found");
    if (!post.is_published) throw new Error("Publish the article before emailing it.");

    const { remaining } = await progress(post.id);
    let sent = 0;
    let stopped: string | null = null;
    for (const email of remaining.slice(0, BATCH_SIZE)) {
      try {
        await sendPostEmail(post, email);
        await db.from("newsletter_sends").insert({ post_id: post.id, email });
        sent++;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // Gmail's daily limit or a login problem: stop; the next send resumes from here.
        if (/limit|quota|5\.4\.5|auth|credentials|535/i.test(message)) {
          stopped = /limit|quota|5\.4\.5/i.test(message)
            ? "Gmail's daily sending limit was reached. Try again tomorrow to send to the rest."
            : "Gmail rejected the login. Check GMAIL_USER and GMAIL_APP_PASSWORD.";
          break;
        }
        // A single bad address: record it so the send doesn't get stuck on it.
        await db.from("newsletter_sends").insert({ post_id: post.id, email });
      }
    }
    return { sent, remaining: Math.max(0, remaining.length - sent), stopped };
  });

/** Unsubscribe link from a blog email (signed per address). */
export const unsubscribeEmail = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ email: z.string().email().max(254), token: z.string().max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();
    if (!validUnsubscribeToken(email, data.token))
      throw new Error("This unsubscribe link isn't valid.");
    const { error } = await getSupabaseAdmin()
      .from("email_unsubscribes")
      .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });
    if (error) throw new Error("We couldn't unsubscribe you. Please try again.");
    return { ok: true };
  });
