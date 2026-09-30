import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  adminCard,
  adminInput,
  AdminPageHeader,
  ConfirmDelete,
  ErrorNote,
  Loading,
  td,
  th,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { adminCategoriesQuery, adminProductsQuery } from "@/lib/admin-queries";
import { slugify } from "@/lib/format";
import { categorySchema } from "@/lib/validation";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/types";

export const Route = createFileRoute("/admin/_dash/categories")({
  component: Categories,
});

type Draft = Pick<Category, "name" | "slug" | "description" | "sort">;

function Categories() {
  const categories = useQuery(adminCategoriesQuery);
  const products = useQuery(adminProductsQuery);
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const save = async (id: string | null, draft: Draft) => {
    const check = categorySchema.safeParse({
      name: draft.name,
      slug: draft.slug || slugify(draft.name),
    });
    if (!check.success) {
      toast.error(check.error.issues[0]?.message ?? "Please check the category");
      return false;
    }
    const values = {
      ...draft,
      slug: draft.slug || slugify(draft.name),
      description: draft.description || null,
    };
    const { error } = id
      ? await supabase.from("categories").update(values).eq("id", id)
      : await supabase.from("categories").insert(values);
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success(id ? "Category saved" : "Category added");
    refresh();
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Category deleted — its products are now uncategorised");
      refresh();
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Group products for the shop filters."
        actions={
          <Button onClick={() => setAdding(true)} disabled={adding}>
            <Plus className="size-4" /> New category
          </Button>
        }
      />
      <div className={adminCard}>
        <ErrorNote error={categories.error} />
        {categories.isLoading ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className={th}>Name</th>
                  <th className={th}>Slug</th>
                  <th className={th}>Description</th>
                  <th className={th}>Sort</th>
                  <th className={th}>Products</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {adding && (
                  <CategoryRow
                    initial={{
                      name: "",
                      slug: "",
                      description: null,
                      sort: (categories.data?.length ?? 0) + 1,
                    }}
                    productCount={0}
                    onSave={async (draft) => {
                      if (await save(null, draft)) setAdding(false);
                    }}
                    onCancel={() => setAdding(false)}
                  />
                )}
                {categories.data?.map((category) => (
                  <CategoryRow
                    key={category.id}
                    initial={category}
                    productCount={
                      products.data?.filter((p) => p.category_id === category.id).length ?? 0
                    }
                    onSave={(draft) => save(category.id, draft).then(() => undefined)}
                    onDelete={() => remove(category.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function CategoryRow({
  initial,
  productCount,
  onSave,
  onDelete,
  onCancel,
}: {
  initial: Draft;
  productCount: number;
  onSave: (draft: Draft) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState<Draft>({
    name: initial.name,
    slug: initial.slug,
    description: initial.description,
    sort: initial.sort,
  });
  useEffect(
    () =>
      setDraft({
        name: initial.name,
        slug: initial.slug,
        description: initial.description,
        sort: initial.sort,
      }),
    [initial.name, initial.slug, initial.description, initial.sort],
  );
  const dirty =
    draft.name !== initial.name ||
    draft.slug !== initial.slug ||
    (draft.description ?? "") !== (initial.description ?? "") ||
    draft.sort !== initial.sort;
  const [busy, setBusy] = useState(false);

  return (
    <tr>
      <td className={td}>
        <input
          value={draft.name}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              name: e.target.value,
              slug: onCancel ? slugify(e.target.value) : d.slug,
            }))
          }
          className={adminInput}
          placeholder="Name"
        />
      </td>
      <td className={td}>
        <input
          value={draft.slug}
          onChange={(e) => setDraft((d) => ({ ...d, slug: slugify(e.target.value) }))}
          className={adminInput}
        />
      </td>
      <td className={td}>
        <input
          value={draft.description ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          className={adminInput}
        />
      </td>
      <td className={td}>
        <input
          type="number"
          value={draft.sort}
          onChange={(e) => setDraft((d) => ({ ...d, sort: Number(e.target.value) || 0 }))}
          className={`${adminInput} w-20`}
        />
      </td>
      <td className={td}>{productCount}</td>
      <td className={`${td} text-right`}>
        <div className="flex justify-end gap-1">
          <Button
            size="small"
            variant={dirty ? "primary" : "ghost"}
            disabled={!dirty || busy || !draft.name}
            onClick={async () => {
              setBusy(true);
              await onSave(draft);
              setBusy(false);
            }}
          >
            <Check className="size-4" /> {onCancel ? "Add" : "Save"}
          </Button>
          {onCancel && (
            <Button size="small" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {onDelete && (
            <ConfirmDelete
              title={`Delete ${initial.name}?`}
              description={`${productCount} product(s) in this category will become uncategorised. Products are not deleted.`}
              onConfirm={onDelete}
            />
          )}
        </div>
      </td>
    </tr>
  );
}
