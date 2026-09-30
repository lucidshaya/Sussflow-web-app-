import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Leaf, Sparkles } from "lucide-react";

import logo from "@/assets/sussflow-logo.png";
import { glassCard, glassPanel, PageHero } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { STATS } from "@/content/site";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title: "About Sussflow | Nigerian Menstrual Health Company" },
      {
        name: "description",
        content:
          "Sussflow Reusable Nigeria Limited is a Lagos-based menstrual health company providing reusable menstrual products and menstrual health education.",
      },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: Sparkles,
    title: "Your period. Your choice.",
    body: "There is no single menstrual product that works for everyone. We help you understand your options so you can choose what works for your body, lifestyle and cycle.",
  },
  {
    icon: Leaf,
    title: "Preventive & sustainable",
    body: "We see reusable menstrual care as part of preventive and sustainable menstrual health—supporting personal care, environmental responsibility and long-term needs.",
  },
  {
    icon: BadgeCheck,
    title: "Quality & safety",
    body: "Our reusable sanitary pad line is SON certified, and we're progressing with NAFDAC registration for applicable products. No intentionally added fragrance or PFAS.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Sussflow"
        title="A Nigerian menstrual health company, based in Lagos."
      >
        Sussflow Reusable Nigeria Limited provides reusable menstrual products, menstrual health
        education and sustainable period-care solutions for women and girls.
      </PageHero>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:grid-cols-[1fr_1.2fr]">
        <div className={`${glassCard} grid place-items-center p-10`}>
          <img
            src={logo}
            alt="Sussflow logo"
            width={1063}
            height={515}
            className="w-full max-w-sm"
          />
        </div>
        <div className="grid gap-5">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <article key={title} className={`${glassPanel} flex gap-4 p-6`}>
              <Icon className="size-7 shrink-0 text-brand" />
              <div>
                <h2 className="font-display text-lg font-semibold">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-foreground/65">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <article key={stat.label} className={`${glassPanel} p-6`}>
              <p className="font-display text-4xl font-semibold text-brand">{stat.value}</p>
              <p className="mt-1 text-sm font-semibold uppercase">{stat.label}</p>
              <p className="mt-2 text-sm text-foreground/65">{stat.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/shop">Shop Sussflow</Link>
          </Button>
          <Button asChild variant="glass">
            <Link to="/education">Partner with us</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
