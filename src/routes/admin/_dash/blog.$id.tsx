import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import { BlogForm } from "@/components/admin/BlogForm";
import { AdminPageHeader, ErrorNote, Loading } from "@/components/admin/ui";
import { adminBlogPostQuery } from "@/lib/admin-queries";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/_dash/blog/$id")({
  component: EditPost,
});

function EditPost() {
  const { id } = Route.useParams();
  const post = useQuery(adminBlogPostQuery(id));
  const queryClient = useQueryClient();

  if (post.isLoading) return <Loading />;
  if (post.error || !post.data)
    return <ErrorNote error={post.error ?? new Error("Article not found")} />;
  const p = post.data;

  return (
    <>
      <Link
        to="/admin/blog"
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 hover:text-brand"
      >
        <ChevronLeft className="size-4" /> Blog
      </Link>
      <AdminPageHeader title="Edit article" description={p.title} />
      <BlogForm
        key={p.id}
        initial={{
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          tag: p.tag,
          image_url: p.image_url,
          body: p.body,
          is_published: p.is_published,
        }}
        submitLabel="Save changes"
        onSubmit={async (values) => {
          const { error } = await supabase
            .from("blog_posts")
            .update({
              ...values,
              ...(values.is_published &&
                !p.published_at && {
                  published_at: new Date().toISOString(),
                }),
            })
            .eq("id", p.id);
          if (error) {
            toast.error(
              error.code === "23505"
                ? "Another article already uses that web address"
                : error.message,
            );
            return;
          }
          toast.success("Article saved");
          void queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
          void queryClient.invalidateQueries({ queryKey: ["blog"] });
        }}
      />
    </>
  );
}
