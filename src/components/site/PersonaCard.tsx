import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import type { Persona } from "@/content/site";

import { glassPanel } from "./primitives";

export function PersonaLink({
  persona,
  className,
  children,
}: {
  persona: Persona;
  className?: string;
  children: React.ReactNode;
}) {
  const link = persona.link;
  if (link.to === "/products/$slug") {
    return (
      <Link to="/products/$slug" params={{ slug: link.slug }} className={className}>
        {children}
      </Link>
    );
  }
  if (link.to === "/shop") {
    return (
      <Link
        to="/shop"
        search={{ category: "category" in link ? link.category : undefined }}
        className={className}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link to={link.to} className={className}>
      {children}
    </Link>
  );
}

export function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <article className={`${glassPanel} flex flex-col p-6`}>
      <p className="font-display text-lg font-semibold leading-snug">“{persona.quote}”</p>
      <p className="mt-3 text-sm leading-relaxed text-foreground/65">{persona.body}</p>
      <p className="mt-4 text-sm font-semibold">
        You're a <span className="text-brand">{persona.name}.</span>
      </p>
      <PersonaLink
        persona={persona}
        className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-brand hover:underline"
      >
        {persona.cta} <ArrowRight className="size-4" />
      </PersonaLink>
    </article>
  );
}
