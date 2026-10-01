import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Pencil, Plus } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { adminBlogPostsQuery } from "@/lib/admin-queries";
import { formatPostDate } from "@/lib/blog";
import { supabase } from "@/lib/supabase";
import type { BlogPostRow } from "@/lib/types";

export const Route = createFileRoute("/admin/_dash/blog/")({
  component: BlogAdmin,
});

function BlogAdmin() {
  const posts = useQuery(adminBlogPostsQuery);
  const queryClient = useQueryClient();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
    void queryClient.invalidateQueries({ queryKey: ["blog"] });
  };

  const setPublished = async (post: BlogPostRow, is_published: boolean) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({
        is_published,
        ...(is_published && !post.published_at && { published_at: new Date().toISOString() }),
      })
      .eq("id", post.id);
    if (error) toast.error(error.message);
    else toast.success(is_published ? "Article published" : "Article moved to drafts");
    refresh();
  };

  return (
    <>
      <AdminPageHeader
        title="Blog"
        description="Write, publish and remove articles. Published articles show on the website's blog and home page."
        actions={
          <Button asChild>
            <Link to="/admin/blog/new">
              <Plus className="size-4" /> New article
            </Link>
          </Button>
        }
      />
      {posts.isLoading ? (
        <Loading />
      ) : posts.error ? (
        <ErrorNote error={posts.error} />
      ) : posts.data === null ? (
        <p className={`${adminCard} text-sm text-foreground/70`}>
          Run <code className="font-semibold">supabase/migrations/0006_sizes_choices_blog.sql</code>{" "}
          in the Supabase SQL editor to enable the blog.
        </p>
      ) : !posts.data?.length ? (
        <p className={`${adminCard} text-sm text-foreground/60`}>No articles yet.</p>
      ) : (
        <ul className="space-y-3">
          {posts.data.map((post) => (
            <li
              key={post.id}
              className={`${adminCard} flex flex-col gap-3 sm:flex-row sm:items-center`}
            >
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt=""
                  className="h-20 w-full rounded-xl object-cover sm:w-28"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{post.title}</p>
                  {post.is_published ? <Pill tone="leaf">Published</Pill> : <Pill>Draft</Pill>}
                </div>
                <p className="mt-0.5 truncate text-sm text-foreground/60">{post.excerpt}</p>
                <p className="mt-0.5 text-xs text-foreground/45">
                  {post.tag}
                  {post.published_at && ` · ${formatPostDate(post.published_at)}`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <LeafSwitch
                  checked={post.is_published}
                  onCheckedChange={(checked) => void setPublished(post, checked)}
                  aria-label={`Published: ${post.title}`}
                />
                {post.is_published && (
                  <Button variant="ghost" size="small" asChild>
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" /> View
                    </a>
                  </Button>
                )}
                <Button variant="ghost" size="small" asChild>
                  <Link to="/admin/blog/$id" params={{ id: post.id }}>
                    <Pencil className="size-4" /> Edit
                  </Link>
                </Button>
                <ConfirmDelete
                  title="Delete this article?"
                  description={`“${post.title}” will be removed from the website. This can't be undone.`}
                  onConfirm={async () => {
                    const { error } = await supabase.from("blog_posts").delete().eq("id", post.id);
                    if (error) {
                      toast.error(error.message);
                      return;
                    }
                    toast.success("Article deleted");
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
