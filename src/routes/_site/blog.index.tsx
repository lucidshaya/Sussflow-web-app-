import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { BlogCard } from "@/components/site/BlogCard";
import { EmptyState, glassCard, PageHero } from "@/components/site/primitives";
import { blogPostsQuery, prefetch } from "@/lib/queries";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/blog/")({
  loader: ({ context: { queryClient } }) => prefetch(queryClient, blogPostsQuery()),
  head: () =>
    seo({
      title: "Period Care Blog: Tips on Reusable Pads, Cups & Your Flow | Sussflow",
      description:
        "Practical, stigma-free period care tips from Sussflow: caring for reusable pads, understanding your flow and switching from disposables.",
      path: "/blog",
    }),
  component: BlogPage,
});

function BlogPage() {
  const posts = useQuery(blogPostsQuery());
  return (
    <>
      <PageHero eyebrow="The Sussflow blog" title="Period care, explained simply">
        Practical tips on reusable pads, period underwear, cups and understanding your cycle.
      </PageHero>
      <section className="mx-auto max-w-7xl px-5 py-8">
        {posts.isLoading ? (
          <div className={`${glassCard} h-72 animate-pulse`} />
        ) : !posts.data?.length ? (
          <EmptyState title="New articles are on the way" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
            {posts.data.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
