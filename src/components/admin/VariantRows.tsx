import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { supabase, unwrap } from "@/lib/supabase";
import type { Variant } from "@/lib/types";
import { cn } from "@/lib/utils";

import { adminInput, ConfirmDelete, LeafSwitch, td, th } from "./ui";

interface Draft {
  length_label: string;
  pack_size: string;
  price: string; // naira
  stock: string;
  sku: string;
  is_active: boolean;
}

function toDraft(variant: Variant): Draft {
  return {
    length_label: variant.length_label ?? "",
    pack_size: String(variant.pack_size),
    price: String(variant.price / 100),
    stock: String(variant.stock),
    sku: variant.sku ?? "",
    is_active: variant.is_active,
  };
}

function fromDraft(draft: Draft) {
  const price = Math.round(Number(draft.price) * 100);
  const pack = Number.parseInt(draft.pack_size, 10);
  const stock = Number.parseInt(draft.stock, 10);
  if (!Number.isFinite(price) || price < 0) throw new Error("Enter a valid price");
  if (!Number.isInteger(pack) || pack < 1) throw new Error("Pack size must be at least 1");
  if (!Number.isInteger(stock) || stock < 0) throw new Error("Stock can't be negative");
  return {
    length_label: draft.length_label.trim() || null,
    pack_size: pack,
    price,
    stock,
    sku: draft.sku.trim() || null,
    is_active: draft.is_active,
  };
}

const EMPTY_DRAFT: Draft = {
  length_label: "",
  pack_size: "1",
  price: "",
  stock: "0",
  sku: "",
  is_active: true,
};

/** Editable price-list rows for one product's variants (create / update / delete). */
export function VariantRows({
  productId,
  variants,
  showHeader = true,
}: {
  productId: string;
  variants: Variant[];
  showHeader?: boolean;
}) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["product"] });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        {showHeader && (
          <thead>
            <tr className="border-b border-foreground/10">
              <th className={th}>Length</th>
              <th className={th}>Pack (in 1)</th>
              <th className={th}>Price (₦)</th>
              <th className={th}>Stock</th>
              <th className={th}>SKU</th>
              <th className={th}>Active</th>
              <th className={cn(th, "text-right")}>Actions</th>
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-foreground/5">
          {variants.map((variant) => (
            <VariantRow key={variant.id} variant={variant} onChanged={invalidate} />
          ))}
          {adding && (
            <NewVariantRow
              productId={productId}
              sort={variants.length + 1}
              onDone={() => setAdding(false)}
              onChanged={invalidate}
            />
          )}
        </tbody>
      </table>
      {!adding && (
        <Button variant="ghost" size="small" className="mt-2" onClick={() => setAdding(true)}>
          <Plus className="size-4" /> Add price option
        </Button>
      )}
    </div>
  );
}

function VariantRow({ variant, onChanged }: { variant: Variant; onChanged: () => void }) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(variant));
  useEffect(() => setDraft(toDraft(variant)), [variant]);
  const original = toDraft(variant);
  const dirty = JSON.stringify(draft) !== JSON.stringify(original);

  const save = useMutation({
    mutationFn: async (next: Draft) =>
      unwrap(
        await supabase
          .from("product_variants")
          .update(fromDraft(next))
          .eq("id", variant.id)
          .select(),
      ),
    onSuccess: () => {
      toast.success("Price option saved");
      onChanged();
    },
    onError: (error) => toast.error(error.message),
  });

  const remove = async () => {
    const { error } = await supabase.from("product_variants").delete().eq("id", variant.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Price option deleted");
    onChanged();
  };

  return (
    <DraftCells
      draft={draft}
      setDraft={setDraft}
      hint={formatNaira(variant.price)}
      actions={
        <>
          <Button
            size="small"
            variant={dirty ? "primary" : "ghost"}
            disabled={!dirty || save.isPending}
            onClick={() => save.mutate(draft)}
          >
            {save.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}{" "}
            Save
          </Button>
          <ConfirmDelete
            title="Delete price option?"
            description="Past orders keep their snapshot, but this option will disappear from the shop. To hide it temporarily, switch it off instead."
            onConfirm={remove}
          />
        </>
      }
      onToggleActive={(checked) => {
        const next = { ...draft, is_active: checked };
        setDraft(next);
        save.mutate(next);
      }}
    />
  );
}

function NewVariantRow({
  productId,
  sort,
  onDone,
  onChanged,
}: {
  productId: string;
  sort: number;
  onDone: () => void;
  onChanged: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const create = useMutation({
    mutationFn: async () =>
      unwrap(
        await supabase
          .from("product_variants")
          .insert({ ...fromDraft(draft), product_id: productId, sort })
          .select(),
      ),
    onSuccess: () => {
      toast.success("Price option added");
      onChanged();
      onDone();
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <DraftCells
      draft={draft}
      setDraft={setDraft}
      onToggleActive={(checked) => setDraft((d) => ({ ...d, is_active: checked }))}
      actions={
        <>
          <Button
            size="small"
            disabled={create.isPending || draft.price === ""}
            onClick={() => create.mutate()}
          >
            {create.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}{" "}
            Add
          </Button>
          <Button size="small" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </>
      }
    />
  );
}

function DraftCells({
  draft,
  setDraft,
  actions,
  hint,
  onToggleActive,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  actions: React.ReactNode;
  hint?: string;
  onToggleActive: (checked: boolean) => void;
}) {
  const set = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));
  const stockLow = Number(draft.stock) <= 5;
  return (
    <tr className={cn(!draft.is_active && "opacity-60")}>
      <td className={td}>
        <input
          value={draft.length_label}
          onChange={set("length_label")}
          placeholder='e.g. 16"'
          className={cn(adminInput, "w-24")}
        />
      </td>
      <td className={td}>
        <input
          value={draft.pack_size}
          onChange={set("pack_size")}
          type="number"
          min={1}
          className={cn(adminInput, "w-20")}
        />
      </td>
      <td className={td}>
        <input
          value={draft.price}
          onChange={set("price")}
          type="number"
          min={0}
          step="50"
          placeholder="0"
          className={cn(adminInput, "w-28 font-semibold")}
          title={hint}
        />
      </td>
      <td className={td}>
        <input
          value={draft.stock}
          onChange={set("stock")}
          type="number"
          min={0}
          className={cn(adminInput, "w-20", stockLow && "border-alert/40 text-alert")}
        />
      </td>
      <td className={td}>
        <input
          value={draft.sku}
          onChange={set("sku")}
          placeholder="SKU"
          className={cn(adminInput, "w-32")}
        />
      </td>
      <td className={td}>
        <LeafSwitch
          checked={draft.is_active}
          onCheckedChange={onToggleActive}
          aria-label="Active"
        />
      </td>
      <td className={cn(td, "text-right")}>
        <div className="flex items-center justify-end gap-1">{actions}</div>
      </td>
    </tr>
  );
}
