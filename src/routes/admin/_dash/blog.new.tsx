import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import { BlogForm, EMPTY_POST } from "@/components/admin/BlogForm";
import { AdminPageHeader } from "@/components/admin/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/_dash/blog/new")({
  component: NewPost,
});

function NewPost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return (
    <>
      <Link
        to="/admin/blog"
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 hover:text-brand"
      >
        <ChevronLeft className="size-4" /> Blog
      </Link>
      <AdminPageHeader title="New article" />
      <BlogForm
        initial={EMPTY_POST}
        submitLabel="Save article"
        onSubmit={async (values) => {
          const { error } = await supabase.from("blog_posts").insert({
            ...values,
            published_at: values.is_published ? new Date().toISOString() : null,
          });
          if (error) {
            toast.error(
              error.code === "23505"
                ? "Another article already uses that web address"
                : error.message,
            );
            return;
          }
          toast.success(values.is_published ? "Article published" : "Draft saved");
          void queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
          void queryClient.invalidateQueries({ queryKey: ["blog"] });
          void navigate({ to: "/admin/blog" });
        }}
      />
    </>
  );
}
