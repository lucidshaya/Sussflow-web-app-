import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { adminCategoriesQuery } from "@/lib/admin-queries";
import type { ProductChoice } from "@/lib/choices";
import { slugify } from "@/lib/format";
import { productBasicsSchema } from "@/lib/validation";
import type { Product } from "@/lib/types";

import { ImageUpload, uploadProductImage } from "./ImageUpload";
import { adminCard, adminInput, LeafSwitch } from "./ui";

export type ProductInput = Pick<
  Product,
  | "name"
  | "slug"
  | "category_id"
  | "tagline"
  | "short_detail"
  | "description"
  | "perfect_for"
  | "image_url"
  | "gallery"
  | "is_active"
  | "featured"
  | "sort"
  | "option_name"
> & { choices: ProductChoice[] };

export const EMPTY_PRODUCT: ProductInput = {
  name: "",
  slug: "",
  category_id: null,
  tagline: null,
  short_detail: null,
  description: null,
  perfect_for: null,
  image_url: null,
  gallery: [],
  is_active: true,
  featured: false,
  sort: 0,
  option_name: "Length",
  choices: [],
};

export function ProductForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: ProductInput;
  submitLabel: string;
  onSubmit: (values: ProductInput) => Promise<void>;
}) {
  const categories = useQuery(adminCategoriesQuery);
  const [values, setValues] = useState<ProductInput>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [busy, setBusy] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setValues((v) => ({ ...v, [key]: value }));
  const text =
    (key: "tagline" | "short_detail" | "description" | "perfect_for") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(key, e.target.value || null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const check = productBasicsSchema.safeParse({
      name: values.name,
      slug: values.slug || slugify(values.name),
      sort: values.sort,
    });
    if (!check.success) {
      toast.error(check.error.issues[0]?.message ?? "Please check the product details");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({ ...values, slug: values.slug || slugify(values.name) });
    } finally {
      setBusy(false);
    }
  };

  const addGallery = async (file: File | undefined) => {
    if (!file) return;
    setGalleryBusy(true);
    try {
      const url = await uploadProductImage(file);
      set("gallery", [...values.gallery, url]);
    } finally {
      setGalleryBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[1fr_320px] [&>*]:min-w-0">
      <div className={`${adminCard} space-y-4`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name *">
            <input
              required
              value={values.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
              className={adminInput}
            />
          </Field>
          <Field label="URL slug *">
            <input
              required
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
              className={adminInput}
            />
          </Field>
          <Field label="Category">
            <select
              value={values.category_id ?? ""}
              onChange={(e) => set("category_id", e.target.value || null)}
              className={adminInput}
            >
              <option value="">Uncategorised</option>
              {categories.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sort order">
            <input
              type="number"
              value={values.sort}
              onChange={(e) => set("sort", Number(e.target.value) || 0)}
              className={adminInput}
            />
          </Field>
        </div>
        <Field label="Tagline (for kits: the quote shown on the Bundles page)">
          <input
            value={values.tagline ?? ""}
            onChange={text("tagline")}
            className={adminInput}
            placeholder="A smarter alternative to disposable sanitary pads."
          />
        </Field>
        <Field label="Short detail (shown on product cards)">
          <input
            value={values.short_detail ?? ""}
            onChange={text("short_detail")}
            className={adminInput}
            placeholder="Up to 100 washes · SON certified"
          />
        </Field>
        <Field label="Description (leave a blank line between paragraphs)">
          <textarea
            value={values.description ?? ""}
            onChange={text("description")}
            rows={6}
            className={adminInput}
          />
        </Field>
        <div className="rounded-2xl border border-glass-border bg-glass-soft p-4">
          <p className="text-xs font-semibold uppercase text-foreground/55">Options & choices</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[12rem_1fr] sm:items-start [&>*]:min-w-0">
            <Field label="Price options are by">
              <select
                value={values.option_name}
                onChange={(e) => set("option_name", e.target.value)}
                className={adminInput}
              >
                <option value="Length">Length (e.g. 16", 14")</option>
                <option value="Size">Size (e.g. XS–4XL, Size 1 / 2)</option>
              </select>
            </Field>
            <p className="text-xs leading-relaxed text-foreground/60 sm:pt-6">
              Each price option below has its own {values.option_name.toLowerCase()}, price and
              stock. Sizes must be picked by the customer before adding to bag.
            </p>
          </div>
          <ChoicesEditor
            initial={initial.choices}
            onChange={(choices) => set("choices", choices)}
          />
        </div>
        <Field label="Perfect for">
          <textarea
            value={values.perfect_for ?? ""}
            onChange={text("perfect_for")}
            rows={2}
            className={adminInput}
          />
        </Field>
      </div>

      <div className="space-y-5">
        <div className={`${adminCard} space-y-4`}>
          <p className="text-xs font-semibold uppercase text-foreground/55">Main image</p>
          <ImageUpload value={values.image_url} onChange={(url) => set("image_url", url)} />
          <p className="text-xs font-semibold uppercase text-foreground/55">Gallery</p>
          <div className="grid grid-cols-3 gap-2">
            {values.gallery.map((url) => (
              <div key={url} className="relative">
                <img src={url} alt="" className="aspect-square w-full rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "gallery",
                      values.gallery.filter((g) => g !== url),
                    )
                  }
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-background/90 text-foreground/70 hover:text-alert"
                  aria-label="Remove gallery image"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border border-dashed border-foreground/20 bg-glass-soft text-foreground/50 hover:text-brand">
              {galleryBusy ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Plus className="size-5" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void addGallery(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
        <div className={`${adminCard} space-y-3`}>
          <label className="flex items-center justify-between gap-3 text-sm font-medium">
            Visible in shop
            <LeafSwitch
              checked={values.is_active}
              onCheckedChange={(checked) => set("is_active", checked)}
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm font-medium">
            Featured on homepage
            <LeafSwitch
              checked={values.featured}
              onCheckedChange={(checked) => set("featured", checked)}
            />
          </label>
          <Button type="submit" className="mt-2 w-full" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />} {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

/**
 * Extra choices with no effect on price or stock (e.g. pads: flow type, colour).
 * Values are typed comma-separated; the customer must pick one of each.
 */
function ChoicesEditor({
  initial,
  onChange,
}: {
  initial: ProductChoice[];
  onChange: (choices: ProductChoice[]) => void;
}) {
  const [rows, setRows] = useState(() =>
    initial.map((c) => ({ name: c.name, values: c.values.join(", ") })),
  );
  const update = (next: { name: string; values: string }[]) => {
    setRows(next);
    onChange(
      next
        .map((r) => ({
          name: r.name.trim(),
          values: r.values
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        }))
        .filter((c) => c.name && c.values.length),
    );
  };
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase text-foreground/55">
        Customer choices (no effect on price)
      </p>
      <div className="mt-2 space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[10rem_1fr_auto] [&>*]:min-w-0">
            <input
              value={row.name}
              onChange={(e) =>
                update(rows.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))
              }
              placeholder="e.g. Flow type"
              aria-label="Choice name"
              maxLength={40}
              className={adminInput}
            />
            <input
              value={row.values}
              onChange={(e) =>
                update(rows.map((r, j) => (j === i ? { ...r, values: e.target.value } : r)))
              }
              placeholder="e.g. Normal flow, Heavy flow"
              aria-label="Options, separated by commas"
              maxLength={300}
              className={adminInput}
            />
            <Button
              type="button"
              variant="ghost"
              size="small"
              onClick={() => update(rows.filter((_, j) => j !== i))}
              aria-label="Remove choice"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="small"
        className="mt-2"
        onClick={() => setRows([...rows, { name: "", values: "" }])}
      >
        <Plus className="size-4" /> Add a choice
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-foreground/55">{label}</span>
      {children}
    </label>
  );
}
