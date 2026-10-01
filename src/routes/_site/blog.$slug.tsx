import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronLeft } from "lucide-react";

import { BlogCard } from "@/components/site/BlogCard";
import { glassCard } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { BLOG_POSTS, formatPostDate, postBySlug, readingMinutes } from "@/content/blog";
import { articleJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/blog/$slug")({
  loader: ({ params }) => {
    const post = postBySlug(params.slug);
    if (!post) throw notFound();
    return { slug: post.slug };
  },
  head: ({ loaderData }) => {
    const post = loaderData ? postBySlug(loaderData.slug) : undefined;
    if (!post) return { meta: [{ title: "Blog | Sussflow" }] };
    return seo({
      title: `${post.title} | Sussflow`,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      image: post.image,
      type: "article",
      jsonLd: [articleJsonLd(post)],
    });
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useLoaderData();
  const post = postBySlug(slug)!;
  const more = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <Link
        to="/blog"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 hover:text-brand"
      >
        <ChevronLeft className="size-4" /> All articles
      </Link>
      <article className={`${glassCard} overflow-hidden`}>
        <img src={post.image} alt={post.imageAlt} className="aspect-[16/9] w-full object-cover" />
        <div className="p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase text-brand">
            {post.tag} · {readingMinutes(post)} min read ·{" "}
            <time dateTime={post.published}>{formatPostDate(post.published)}</time>
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-6 space-y-6">
            {post.sections.map((section, i) => (
              <section key={section.heading ?? i}>
                {section.heading && (
                  <h2 className="font-display text-xl font-semibold">{section.heading}</h2>
                )}
                {section.paragraphs?.map((para) => (
                  <p key={para} className="mt-2 leading-relaxed text-foreground/75">
                    {para}
                  </p>
                ))}
                {section.list && (
                  <ul className="mt-3 space-y-2">
                    {section.list.map((item) => (
                      <li key={item} className="flex gap-2 leading-relaxed text-foreground/75">
                        <Check className="mt-1 size-4 shrink-0 text-leaf" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
          <Button asChild className="mt-8">
            <Link to={post.cta.to}>
              {post.cta.label} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </article>

      {more.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Keep reading</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 [&>*]:min-w-0">
            {more.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
