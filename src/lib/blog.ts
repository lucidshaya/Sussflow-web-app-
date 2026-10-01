// Blog posts live in Supabase (`blog_posts`) and are written in Admin → Blog.
// Body format: blank lines separate blocks; "## " starts a heading; lines starting "- " are a list.

export type BlogBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export function parseBody(body: string): BlogBlock[] {
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block): BlogBlock => {
      if (block.startsWith("## ")) return { type: "heading", text: block.slice(3).trim() };
      const lines = block.split("\n").map((l) => l.trim());
      if (lines.every((l) => l.startsWith("- ")))
        return { type: "list", items: lines.map((l) => l.slice(2).trim()) };
      return { type: "paragraph", text: lines.join(" ") };
    });
}

/** Rough reading time at ~200 words a minute. */
export function readingMinutes(body: string) {
  return Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 200));
}

export const formatPostDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })
    : "";
