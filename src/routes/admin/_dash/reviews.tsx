import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import {
  adminCard,
  AdminPageHeader,
  ConfirmDelete,
  ErrorNote,
  LeafSwitch,
  Loading,
  Pill,
} from "@/components/admin/ui";
import { Stars } from "@/components/site/Stars";
import { adminReviewsQuery, type AdminReview } from "@/lib/admin-queries";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/_dash/reviews")({
  component: Reviews,
});

const FILTERS = [
  { id: "pending", label: "Waiting for approval" },
  { id: "approved", label: "Approved" },
  { id: "all", label: "All" },
] as const;

function Reviews() {
  const reviews = useQuery(adminReviewsQuery);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("pending");
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    void queryClient.invalidateQueries({ queryKey: ["reviews"] });
  };

  const setApproved = async (review: AdminReview, is_approved: boolean) => {
    const { error } = await supabase
      .from("product_reviews")
      .update({ is_approved })
      .eq("id", review.id);
    if (error) toast.error(error.message);
    else toast.success(is_approved ? "Review approved — it's now on the website" : "Review hidden");
    refresh();
  };

  const all = reviews.data ?? [];
  const pending = all.filter((r) => !r.is_approved).length;
  const shown = all.filter((r) =>
    filter === "all" ? true : filter === "approved" ? r.is_approved : !r.is_approved,
  );

  return (
    <>
      <AdminPageHeader
        title="Reviews"
        description="Customer ratings appear on product pages only after you approve them."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold",
              filter === f.id
                ? "border-brand bg-brand text-primary-foreground"
                : "border-glass-border bg-glass hover:border-brand/50",
            )}
          >
            {f.label}
            {f.id === "pending" && pending > 0 ? ` (${pending})` : ""}
          </button>
        ))}
      </div>
      {reviews.isLoading ? (
        <Loading />
      ) : reviews.error ? (
        <ErrorNote error={reviews.error} />
      ) : reviews.data === null ? (
        <p className={`${adminCard} text-sm text-foreground/70`}>
          Run{" "}
          <code className="font-semibold">
            supabase/migrations/0007_sizes_reviews_zones_banner.sql
          </code>{" "}
          to enable reviews.
        </p>
      ) : !shown.length ? (
        <p className={`${adminCard} text-sm text-foreground/60`}>Nothing here.</p>
      ) : (
        <ul className="space-y-3">
          {shown.map((review) => (
            <li key={review.id} className={`${adminCard} flex flex-col gap-3 sm:flex-row`}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Stars value={review.rating} />
                  <span className="font-semibold">{review.name}</span>
                  {review.is_approved ? <Pill tone="leaf">On website</Pill> : <Pill>Waiting</Pill>}
                </div>
                <p className="mt-1 text-xs text-foreground/55">
                  {review.products?.name ?? "Deleted product"} ·{" "}
                  {new Date(review.created_at).toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                {review.comment && (
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  Approved
                  <LeafSwitch
                    checked={review.is_approved}
                    onCheckedChange={(checked) => void setApproved(review, checked)}
                    aria-label={`Approve review by ${review.name}`}
                  />
                </label>
                <ConfirmDelete
                  title="Delete this review?"
                  description="It will be removed permanently."
                  onConfirm={async () => {
                    const { error } = await supabase
                      .from("product_reviews")
                      .delete()
                      .eq("id", review.id);
                    if (error) {
                      toast.error(error.message);
                      return;
                    }
                    toast.success("Review deleted");
                    refresh();
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
