import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { glassCard, PageHero } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { formatNaira, lowestPrice } from "@/lib/format";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_site/bundles")({
  head: () => ({
    meta: [
      { title: "Period Care Bundles | Sussflow Nigeria" },
      {
        name: "description",
        content:
          "Sussflow bundles designed around different period-care journeys: Curious Switcher, Pad Girl, Cup Convert, Period Peace Kit and First Period Box.",
      },
    ],
  }),
  component: BundlesPage,
});

const BUNDLES = [
  {
    slug: "the-curious-switcher",
    name: "The Curious Switcher",
    quote: "I know I want to switch. I just don't know what suits me yet.",
    body: [
      "You've been thinking about moving away from disposable sanitary pads, but you don't want to make a big leap without understanding your options.",
      "Start here. A carefully selected introduction to reusable menstrual care designed to help you discover what works for you.",
    ],
    perfectFor: "First-time switchers, beginners and anyone exploring reusable menstrual products.",
    cta: "Start my switch",
    image: "/images/kit.jpg",
  },
  {
    slug: "the-pad-girl",
    name: "The Pad Girl",
    quote: "Give me a pad. Just make it reusable.",
    body: [
      "You know what you like. You're comfortable with pads, you don't want to insert anything, and you're ready for a long-term alternative to disposable sanitary pads.",
      "A practical reusable pad setup designed to support different days of your cycle.",
    ],
    perfectFor:
      "Pad lovers, comfort-first customers and women making the switch from disposable pads.",
    cta: "I'm a Pad Girl",
    image: "/images/pads.jpg",
  },
  {
    slug: "the-cup-convert",
    name: "The Cup Convert",
    quote: "I'm ready for freedom.",
    body: [
      "You've done the research. You're ready to try a menstrual cup—or you already know cups are your thing.",
      "This bundle brings together your menstrual cup and essential cup-care products.",
    ],
    perfectFor: "First-time cup users and women looking for long-term reusable period care.",
    cta: "Become a Cup Girl",
    image: "/images/cup.jpg",
  },
  {
    slug: "the-period-peace-kit",
    name: "The Period Peace Kit",
    quote: "I don't want to think about my period every month.",
    body: [
      "You want your period care sorted. Different flow days. Different situations. One thoughtful setup.",
      "This is your “I've got this” period-care kit.",
    ],
    perfectFor:
      "Busy women, students, working professionals, travellers and anyone building a dependable period-care routine.",
    cta: "Get my period sorted",
    image: "/images/underwear.jpg",
  },
  {
    slug: "the-first-period-box",
    name: "The First Period Box",
    quote: "I want her first period to feel normal—not scary.",
    body: [
      "For parents, guardians and loved ones preparing a young girl for menstruation.",
      "The First Period Box combines practical menstrual care, education and useful tools to help her understand menstruation and navigate her first periods with confidence.",
    ],
    perfectFor: "Daughters, nieces, sisters, students and girls preparing for their first period.",
    cta: "Prepare her with confidence",
    image: "/images/kit.jpg",
  },
];

function BundlesPage() {
  const live = useQuery(productsQuery({ categorySlug: "bundles" }));

  return (
    <>
      <PageHero
        eyebrow="Find your Sussflow bundle"
        title="Not sure which menstrual products to choose?"
      >
        We've made choosing easier. These aren't just product bundles.{" "}
        <strong className="text-foreground">
          They're designed around different period-care journeys.
        </strong>
      </PageHero>
      <section className="mx-auto max-w-7xl space-y-6 px-5 py-8">
        {BUNDLES.map((bundle, index) => {
          const product = live.data?.find((p) => p.slug === bundle.slug);
          const price = product ? lowestPrice(product.product_variants) : null;
          return (
            <article
              key={bundle.slug}
              className={`${glassCard} grid items-center gap-8 p-7 md:grid-cols-2 md:p-10`}
            >
              <img
                src={product?.image_url ?? bundle.image}
                alt={bundle.name}
                loading="lazy"
                className={`aspect-[4/3] w-full rounded-2xl object-cover ${index % 2 ? "md:order-2" : ""}`}
              />
              <div>
                <p className="text-xs font-semibold uppercase text-brand">{bundle.name}</p>
                <h2 className="mt-2 font-display text-3xl font-semibold leading-tight">
                  “{bundle.quote}”
                </h2>
                {bundle.body.map((para) => (
                  <p key={para} className="mt-3 leading-relaxed text-foreground/70">
                    {para}
                  </p>
                ))}
                <p className="mt-4 rounded-2xl border border-glass-border bg-glass-soft p-4 text-sm">
                  <strong>Perfect for:</strong> {bundle.perfectFor}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  {product ? (
                    <>
                      <Button asChild>
                        <Link to="/products/$slug" params={{ slug: product.slug }}>
                          {bundle.cta} <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                      {price != null && (
                        <span className="font-display text-xl font-semibold">
                          {formatNaira(price)}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <Button asChild variant="glass">
                        <Link to="/store-location">Chat with us to order</Link>
                      </Button>
                      <span className="text-sm font-medium text-foreground/60">
                        Online ordering coming soon
                      </span>
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
