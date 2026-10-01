import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronLeft } from "lucide-react";

import { BlogCard } from "@/components/site/BlogCard";
import { glassCard } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { formatPostDate, parseBody, readingMinutes } from "@/lib/blog";
import { blogPostQuery, blogPostsQuery, prefetch } from "@/lib/queries";
import { articleJsonLd, seo } from "@/lib/seo";
import { isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/_site/blog/$slug")({
  loader: async ({ context: { queryClient }, params }) => {
    if (!isSupabaseConfigured) throw notFound();
    const post = await queryClient.ensureQueryData(blogPostQuery(params.slug));
    if (!post) throw notFound();
    await prefetch(queryClient, blogPostsQuery(4));
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return { meta: [{ title: "Blog | Sussflow" }] };
    return seo({
      title: `${post.title} | Sussflow`,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      image: post.image_url,
      type: "article",
      jsonLd: [articleJsonLd(post)],
    });
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const loaded = Route.useLoaderData().post;
  const post = useQuery(blogPostQuery(slug)).data ?? loaded;
  const latest = useQuery(blogPostsQuery(4));
  const more = (latest.data ?? []).filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <Link
        to="/blog"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 hover:text-brand"
      >
        <ChevronLeft className="size-4" /> All articles
      </Link>
      <article className={`${glassCard} overflow-hidden`}>
        {post.image_url && (
          <img src={post.image_url} alt="" className="aspect-[16/9] w-full object-cover" />
        )}
        <div className="p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase text-brand">
            {post.tag} · {readingMinutes(post.body)} min read
            {post.published_at && (
              <>
                {" · "}
                <time dateTime={post.published_at}>{formatPostDate(post.published_at)}</time>
              </>
            )}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-6 space-y-4">
            {parseBody(post.body).map((block, i) =>
              block.type === "heading" ? (
                <h2 key={i} className="pt-2 font-display text-xl font-semibold">
                  {block.text}
                </h2>
              ) : block.type === "list" ? (
                <ul key={i} className="space-y-2">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-2 leading-relaxed text-foreground/75">
                      <Check className="mt-1 size-4 shrink-0 text-leaf" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p key={i} className="leading-relaxed text-foreground/75">
                  {block.text}
                </p>
              ),
            )}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/shop">
                Shop Sussflow <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="glass">
              <Link to="/find-your-fit">Find your period care</Link>
            </Button>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Keep reading</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 [&>*]:min-w-0">
            {more.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
