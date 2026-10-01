import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { formatPostDate, readingMinutes, type BlogPost } from "@/content/blog";

import { glassPanel } from "./primitives";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className={`${glassPanel} group flex flex-col overflow-hidden`}>
      <Link to="/blog/$slug" params={{ slug: post.slug }} tabIndex={-1} aria-hidden="true">
        <img
          src={post.image}
          alt=""
          loading="lazy"
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase text-brand">
          {post.tag} · {readingMinutes(post)} min read
        </p>
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug">
          <Link to="/blog/$slug" params={{ slug: post.slug }} className="hover:text-brand">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/65">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between gap-2 text-xs text-foreground/55">
          <time dateTime={post.published}>{formatPostDate(post.published)}</time>
          <Link
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="inline-flex items-center gap-1 font-semibold text-brand"
            aria-label={`Read: ${post.title}`}
          >
            Read <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
