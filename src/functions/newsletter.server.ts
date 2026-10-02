import { createHmac, timingSafeEqual } from "node:crypto";

import nodemailer, { type Transporter } from "nodemailer";

import { getSupabaseAdmin, serverEnv } from "@/lib/supabase.server";
import type { BlogPostRow } from "@/lib/types";

// Blog emails go out through Gmail (GMAIL_USER + a Google app password in GMAIL_APP_PASSWORD).
// Gmail allows roughly 500 recipients a day, so sends run in small batches and are logged in
// `newsletter_sends`; a stopped send resumes without emailing anyone twice.

export const BATCH_SIZE = 20;

export function gmailConfigured() {
  return Boolean(process.env["GMAIL_USER"] && process.env["GMAIL_APP_PASSWORD"]);
}

let transport: Transporter | undefined;
function mailer() {
  transport ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: serverEnv("GMAIL_USER"),
      pass: serverEnv("GMAIL_APP_PASSWORD").replace(/\s/g, ""),
    },
  });
  return transport;
}

export const siteUrl = () =>
  (process.env["SITE_URL"] ?? "https://www.sussflow.com").replace(/\/$/, "");

/** Signed token so unsubscribe links can't be forged for other people's emails. */
export function unsubscribeToken(email: string) {
  return createHmac("sha256", serverEnv("SUPABASE_SERVICE_ROLE_KEY"))
    .update(`unsubscribe:${email.toLowerCase()}`)
    .digest("hex")
    .slice(0, 32);
}

export function validUnsubscribeToken(email: string, token: string) {
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Everyone on the email list (footer + store waitlist sign-ups), minus unsubscribes. */
export async function subscribers() {
  const db = getSupabaseAdmin();
  const [{ data: rows, error }, { data: out }] = await Promise.all([
    db.from("enquiries").select("email").eq("type", "waitlist"),
    db.from("email_unsubscribes").select("email"),
  ]);
  if (error) throw new Error(error.message);
  const unsubscribed = new Set((out ?? []).map((r) => (r.email as string).toLowerCase()));
  const emails = new Set<string>();
  for (const row of rows ?? []) {
    const email = String(row.email ?? "")
      .trim()
      .toLowerCase();
    if (email.includes("@") && !unsubscribed.has(email)) emails.add(email);
  }
  return [...emails];
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function emailContent(post: BlogPostRow, email: string) {
  const base = siteUrl();
  const articleUrl = `${base}/blog/${post.slug}?utm_source=newsletter&utm_medium=email`;
  const unsubscribeUrl = `${base}/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;
  const image = post.image_url ? new URL(post.image_url, `${base}/`).href : null;
  const html = `<!doctype html><html><body style="margin:0;background:#f8eef7;font-family:Poppins,Arial,sans-serif;color:#3b3a3a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8eef7;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden">
<tr><td style="padding:20px 24px"><img src="${base}/logo.png" alt="Sussflow" width="120" style="display:block;height:auto"></td></tr>
${image ? `<tr><td><img src="${escapeHtml(image)}" alt="" width="560" style="display:block;width:100%;height:auto"></td></tr>` : ""}
<tr><td style="padding:24px">
<p style="margin:0;font-size:12px;font-weight:600;text-transform:uppercase;color:#b35db0">${escapeHtml(post.tag)}</p>
<h1 style="margin:8px 0 12px;font-size:24px;line-height:1.25;color:#3b3a3a">${escapeHtml(post.title)}</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#5c5a5a">${escapeHtml(post.excerpt)}</p>
<a href="${articleUrl}" style="display:inline-block;background:#3b3a3a;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px">Read the article</a>
</td></tr>
<tr><td style="padding:16px 24px 24px;font-size:12px;line-height:1.6;color:#8a8888;border-top:1px solid #f0e4ef">
You're receiving this because you joined the Sussflow email list at sussflow.com.<br>
<a href="${unsubscribeUrl}" style="color:#8a8888">Unsubscribe</a> · Sussflow Reusable Nigeria Limited, Lagos
</td></tr></table></td></tr></table></body></html>`;
  const text = `${post.title}\n\n${post.excerpt}\n\nRead the article: ${articleUrl}\n\n—\nUnsubscribe: ${unsubscribeUrl}`;
  return { html, text, unsubscribeUrl };
}

export async function sendPostEmail(post: BlogPostRow, email: string) {
  const { html, text, unsubscribeUrl } = emailContent(post, email);
  await mailer().sendMail({
    from: { name: "Sussflow", address: serverEnv("GMAIL_USER") },
    to: email,
    subject: post.title,
    html,
    text,
    headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
  });
}
