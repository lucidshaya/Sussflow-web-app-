import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { parseBody } from "@/lib/blog";
import { slugify } from "@/lib/format";
import type { BlogPostRow } from "@/lib/types";
import { cn } from "@/lib/utils";
import { blogPostSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";

import { ImageUpload } from "./ImageUpload";
import { adminCard, adminInput, adminInvalid, AdminField, LeafSwitch } from "./ui";

export type BlogInput = Pick<
  BlogPostRow,
  "title" | "slug" | "excerpt" | "tag" | "image_url" | "body" | "is_published"
>;

export const EMPTY_POST: BlogInput = {
  title: "",
  slug: "",
  excerpt: "",
  tag: "Period care",
  image_url: null,
  body: "",
  is_published: false,
};

/** Create / edit a blog post. Body: blank line between paragraphs, "## " headings, "- " lists. */
export function BlogForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: BlogInput;
  submitLabel: string;
  onSubmit: (values: BlogInput) => Promise<void>;
}) {
  const [values, setValues] = useState<BlogInput>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof BlogInput>(key: K, value: BlogInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const cls = (key: string) => cn(adminInput, errors[key] && adminInvalid);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = blogPostSchema.safeParse({
      ...values,
      slug: values.slug || slugify(values.title),
    });
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({ ...values, ...result.data });
    } finally {
      setBusy(false);
    }
  };

  const blocks = parseBody(values.body);

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid gap-5 xl:grid-cols-[1fr_320px] [&>*]:min-w-0"
    >
      <div className={`${adminCard} space-y-4`}>
        <AdminField label="Title *" error={errors["title"]}>
          <input
            value={values.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!slugTouched) set("slug", slugify(e.target.value));
            }}
            maxLength={140}
            className={cls("title")}
          />
        </AdminField>
        <div className="grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
          <AdminField
            label="Web address *"
            error={errors["slug"]}
            hint={`sussflow.com/blog/${values.slug || "…"}`}
          >
            <input
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
              maxLength={100}
              className={cls("slug")}
            />
          </AdminField>
          <AdminField label="Tag *" error={errors["tag"]} hint="e.g. Pad care, Know your body">
            <input
              value={values.tag}
              onChange={(e) => set("tag", e.target.value)}
              maxLength={40}
              className={cls("tag")}
            />
          </AdminField>
        </div>
        <AdminField
          label="Summary *"
          error={errors["excerpt"]}
          hint="Shown on the article card and in Google results (about 1–2 sentences)."
        >
          <textarea
            value={values.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            rows={2}
            maxLength={300}
            className={cls("excerpt")}
          />
        </AdminField>
        <AdminField
          label="Article *"
          error={errors["body"]}
          hint='Leave a blank line between paragraphs. Start a line with "## " for a heading, "- " for a bullet point.'
        >
          <textarea
            value={values.body}
            onChange={(e) => set("body", e.target.value)}
            rows={18}
            className={cn(cls("body"), "font-mono text-[13px] leading-relaxed")}
          />
        </AdminField>
        <p className="text-xs text-foreground/55">
          {blocks.length} blocks · {blocks.filter((b) => b.type === "heading").length} headings
        </p>
      </div>

      <div className="space-y-5">
        <div className={`${adminCard} space-y-4`}>
          <p className="text-xs font-semibold uppercase text-foreground/55">Cover image</p>
          <ImageUpload
            value={values.image_url}
            onChange={(url) => set("image_url", url)}
            folder="blog"
          />
          <label className="flex items-center justify-between gap-3 text-sm font-semibold">
            Published on the website
            <LeafSwitch
              checked={values.is_published}
              onCheckedChange={(checked) => set("is_published", checked)}
              aria-label="Published"
            />
          </label>
          <p className="text-xs text-foreground/55">
            Drafts are only visible here. Published articles appear on the blog, the home page and
            Google's sitemap.
          </p>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />} {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
