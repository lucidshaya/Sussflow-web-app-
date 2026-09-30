import { Link } from "@tanstack/react-router";
import { BadgeCheck, ChevronLeft, ChevronRight, MapPin, Star, Truck, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import heroCups from "@/assets/hero-cups.jpg";
import heroFlatlay from "@/assets/hero-flatlay.jpg";
import heroPads from "@/assets/hero-pads.jpg";
import { cn } from "@/lib/utils";

type SlideLink =
  | { to: "/products/$slug"; slug: string }
  | { to: "/find-your-fit" }
  | { to: "/shop"; category: string };

const SLIDES: {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  cta: string;
  link: SlideLink;
  position?: string;
}[] = [
  {
    image: heroPads,
    alt: "Colourful Sussflow reusable menstrual pads",
    eyebrow: "Home of",
    title: "Smarter reusable period care",
    cta: "Find my period care",
    link: { to: "/find-your-fit" },
  },
  {
    image: heroCups,
    alt: "Sussflow menstrual cups in orange, clear and pink with their boxes",
    eyebrow: "Meet the",
    title: "Sussflow Menstrual Cup",
    cta: "Shop menstrual cups",
    link: { to: "/products/$slug", slug: "menstrual-cup" },
  },
  {
    image: heroFlatlay,
    alt: "Sussflow period underwear, reusable pad and carry pouch",
    eyebrow: "Period protection",
    title: "Without the feel of a pad",
    cta: "Shop period underwear",
    link: { to: "/products/$slug", slug: "period-underwear" },
    position: "center 40%",
  },
];

const INTERVAL = 6500;

export function HomeHero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = useCallback((next: number) => setIndex((next + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const id = window.setTimeout(() => go(index + 1), INTERVAL);
    return () => window.clearTimeout(id);
  }, [index, paused, go]);

  return (
    <section
      className="relative h-[78svh] min-h-[520px] w-full overflow-hidden bg-lilac sm:h-[86svh] sm:max-h-[860px]"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.title}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-out",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden={i !== index}
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${SLIDES.length}`}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className={cn(
              "size-full object-cover transition-transform duration-[7000ms] ease-out",
              i === index ? "scale-105" : "scale-100",
            )}
            style={{ objectPosition: slide.position ?? "center" }}
            fetchPriority={i === 0 ? "high" : "low"}
            loading={i === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10" />
          <div className="absolute inset-x-0 bottom-[14%] flex flex-col items-center px-5 text-center">
            <span className="bg-primary-foreground/95 px-4 py-1.5 text-sm font-medium uppercase tracking-[0.25em] text-brand sm:text-lg">
              {slide.eyebrow}
            </span>
            <h2 className="font-statement mt-0 bg-lilac/95 px-5 py-2 text-4xl leading-[1.05] text-brand sm:px-8 sm:py-3 sm:text-6xl lg:text-7xl">
              {slide.title}
            </h2>
            <SlideCta link={slide.link} tabIndex={i === index ? 0 : -1}>
              {slide.cta}
            </SlideCta>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => go(index - 1)}
        className="absolute left-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-primary-foreground/95 text-foreground shadow-glass transition hover:scale-105 sm:left-6"
        aria-label="Previous slide"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        className="absolute right-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-primary-foreground/95 text-foreground shadow-glass transition hover:scale-105 sm:right-6"
        aria-label="Next slide"
      >
        <ChevronRight className="size-5" />
      </button>
      <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => go(i)}
            className={cn(
              "h-2 rounded-full bg-primary-foreground transition-all",
              i === index ? "w-6" : "w-2 opacity-60 hover:opacity-100",
            )}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
          />
        ))}
      </div>
    </section>
  );
}

function SlideCta({
  link,
  tabIndex,
  children,
}: {
  link: SlideLink;
  tabIndex: number;
  children: React.ReactNode;
}) {
  const className =
    "mt-4 inline-flex h-14 items-center bg-brand px-8 text-base font-medium uppercase tracking-[0.12em] text-primary-foreground shadow-glass transition hover:bg-primary sm:h-16 sm:px-12 sm:text-xl";
  if (link.to === "/products/$slug") {
    return (
      <Link
        to="/products/$slug"
        params={{ slug: link.slug }}
        className={className}
        tabIndex={tabIndex}
      >
        {children}
      </Link>
    );
  }
  if (link.to === "/shop") {
    return (
      <Link
        to="/shop"
        search={{ category: link.category }}
        className={className}
        tabIndex={tabIndex}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link to={link.to} className={className} tabIndex={tabIndex}>
      {children}
    </Link>
  );
}

const TRUST = [
  { icon: Star, text: "700+ happy customers" },
  { icon: Truck, text: "Nationwide courier & waybill delivery" },
  { icon: MapPin, text: "Pickup in Lagos (Iju axis)" },
  { icon: BadgeCheck, text: "SON-certified reusable pads" },
  { icon: Users, text: "2,000+ girls reached through education" },
];

export function TrustStrip() {
  return (
    <div className="overflow-hidden bg-brand py-3.5 text-primary-foreground">
      <div className="marquee-track flex w-max whitespace-nowrap text-sm font-medium">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex" aria-hidden={copy === 1}>
            {TRUST.map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-2 px-10">
                <Icon className="size-4 text-lilac" /> {text}
                <span className="pl-10 text-primary-foreground/40">·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnnouncementBar() {
  return (
    <div className="flex items-center justify-center bg-primary-foreground px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-brand sm:text-sm">
      Reusable period care for Nigeria · Lagos pickup &amp; nationwide delivery
    </div>
  );
}
