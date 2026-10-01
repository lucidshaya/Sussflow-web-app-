import { createFileRoute } from "@tanstack/react-router";

import { BlogCard } from "@/components/site/BlogCard";
import { PageHero } from "@/components/site/primitives";
import { BLOG_POSTS } from "@/content/blog";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/blog/")({
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
  return (
    <>
      <PageHero eyebrow="The Sussflow blog" title="Period care, explained simply">
        Practical tips on reusable pads, period underwear, cups and understanding your cycle.
      </PageHero>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-8 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
        {BLOG_POSTS.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </section>
    </>
  );
}
