import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { adminProductsQuery } from "@/lib/admin-queries";
import { supabase } from "@/lib/supabase";
import type { BundleItem, BundleItemKind } from "@/lib/types";
import { cn } from "@/lib/utils";
import { bundleItemSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";

import { adminInput, adminInvalid, ConfirmDelete, ErrorNote, Loading } from "./ui";

const KINDS: { value: BundleItemKind; label: string; hint: string }[] = [
  { value: "included", label: "What's inside", hint: "Shown as the kit's contents" },
  { value: "addon", label: "Add-on", hint: "Extras customers can add" },
  { value: "related", label: "Related", hint: "Linked product button" },
];

interface Draft {
  kind: BundleItemKind;
  product_id: string;
  label: string;
  quantity: string;
  sort: string;
}

const toDraft = (item: BundleItem): Draft => ({
  kind: item.kind,
  product_id: item.product_id ?? "",
  label: item.label ?? "",
  quantity: String(item.quantity),
  sort: String(item.sort),
});

/** Admin CRUD for a kit's contents, add-ons and related products (table `bundle_items`). */
export function KitItemsEditor({ bundleId }: { bundleId: string }) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const items = useQuery({
    queryKey: ["admin", "bundle-items", bundleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bundle_items")
        .select("*")
        .eq("bundle_id", bundleId)
        .order("sort");
      if (error?.code === "PGRST205" || error?.code === "42P01") return null; // not migrated yet
      if (error) throw new Error(error.message);
      return data as BundleItem[];
    },
  });
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "bundle-items", bundleId] });
    void queryClient.invalidateQueries({ queryKey: ["bundle-items"] });
  };

  if (items.isLoading) return <Loading />;
  if (items.error) return <ErrorNote error={items.error} />;
  if (items.data === null)
    return (
      <p className="rounded-2xl border border-glass-border bg-glass-soft p-4 text-sm text-foreground/70">
        Run{" "}
        <code className="font-semibold">supabase/migrations/0005_kits_socials_security.sql</code> in
        the Supabase SQL editor to enable kit contents.
      </p>
    );

  return (
    <div className="space-y-3">
      {items.data?.length === 0 && !adding && (
        <p className="text-sm text-foreground/60">
          No kit contents yet. Regular products can leave this empty.
        </p>
      )}
      {items.data?.map((item) => (
        <ItemRow key={item.id} bundleId={bundleId} item={item} onChanged={invalidate} />
      ))}
      {adding ? (
        <ItemRow
          bundleId={bundleId}
          sort={(items.data?.length ?? 0) + 1}
          onChanged={invalidate}
          onDone={() => setAdding(false)}
        />
      ) : (
        <Button variant="ghost" size="small" onClick={() => setAdding(true)}>
          <Plus className="size-4" /> Add kit item
        </Button>
      )}
    </div>
  );
}

function ItemRow({
  bundleId,
  item,
  sort = 0,
  onChanged,
  onDone,
}: {
  bundleId: string;
  item?: BundleItem;
  sort?: number;
  onChanged: () => void;
  onDone?: () => void;
}) {
  const products = useQuery(adminProductsQuery);
  const initial: Draft = item
    ? toDraft(item)
    : { kind: "included", product_id: "", label: "", quantity: "1", sort: String(sort) };
  const [draft, setDraft] = useState<Draft>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  useEffect(() => {
    if (item) setDraft(toDraft(item));
  }, [item]);
  const dirty = !item || JSON.stringify(draft) !== JSON.stringify(toDraft(item));

  const save = useMutation({
    mutationFn: async () => {
      const result = bundleItemSchema.safeParse(draft);
      if (!result.success) {
        setErrors(toFieldErrors(result.error));
        throw new Error("Please fix the highlighted fields.");
      }
      setErrors({});
      const values = { ...result.data, bundle_id: bundleId };
      const { error } = item
        ? await supabase.from("bundle_items").update(values).eq("id", item.id)
        : await supabase.from("bundle_items").insert(values);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success(item ? "Kit item saved" : "Kit item added");
      onChanged();
      onDone?.();
    },
    onError: (error) => toast.error(error.message),
  });

  const set = (key: keyof Draft) => (value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const choices = (products.data ?? []).filter((p) => p.id !== bundleId);

  return (
    <div className="grid gap-2 rounded-2xl border border-glass-border bg-glass-soft p-3 sm:grid-cols-[9rem_1fr_1fr_4.5rem_auto] sm:items-start">
      <label className="block text-xs font-semibold text-foreground/55">
        <span className="sm:sr-only">Type</span>
        <select
          value={draft.kind}
          onChange={(e) => set("kind")(e.target.value)}
          className={cn(adminInput, "mt-1 sm:mt-0")}
          title={KINDS.find((k) => k.value === draft.kind)?.hint}
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-semibold text-foreground/55">
        <span className="sm:sr-only">Product</span>
        <select
          value={draft.product_id}
          onChange={(e) => set("product_id")(e.target.value)}
          className={cn(adminInput, "mt-1 sm:mt-0", errors["product_id"] && adminInvalid)}
        >
          <option value="">
            {draft.kind === "included" ? "— Custom item (type below) —" : "Choose a product"}
          </option>
          {choices.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.is_active ? "" : " (hidden)"}
            </option>
          ))}
        </select>
        {errors["product_id"] && (
          <span role="alert" className="mt-1 block font-medium text-alert">
            {errors["product_id"]}
          </span>
        )}
      </label>
      <label className="block text-xs font-semibold text-foreground/55">
        <span className="sm:sr-only">Custom text</span>
        <input
          value={draft.label}
          onChange={(e) => set("label")(e.target.value)}
          placeholder={draft.product_id ? "Optional note" : "e.g. Carry-on pouch"}
          disabled={draft.kind !== "included" && Boolean(draft.product_id)}
          maxLength={80}
          className={cn(adminInput, "mt-1 sm:mt-0", errors["label"] && adminInvalid)}
        />
      </label>
      <label className="block text-xs font-semibold text-foreground/55">
        <span className="sm:sr-only">Quantity</span>
        <input
          type="number"
          min={1}
          max={99}
          value={draft.quantity}
          onChange={(e) => set("quantity")(e.target.value)}
          aria-label="Quantity"
          className={cn(adminInput, "mt-1 sm:mt-0", errors["quantity"] && adminInvalid)}
        />
      </label>
      <div className="flex items-center justify-end gap-1">
        <Button
          size="small"
          variant={dirty ? "primary" : "ghost"}
          disabled={!dirty || save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : item ? (
            <Check className="size-4" />
          ) : (
            <Plus className="size-4" />
          )}{" "}
          {item ? "Save" : "Add"}
        </Button>
        {item ? (
          <ConfirmDelete
            title="Remove this kit item?"
            description="It will no longer show on the kit. The product itself isn't affected."
            onConfirm={async () => {
              const { error } = await supabase.from("bundle_items").delete().eq("id", item.id);
              if (error) {
                toast.error(error.message);
                return;
              }
              toast.success("Kit item removed");
              onChanged();
            }}
          />
        ) : (
          <Button size="small" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
