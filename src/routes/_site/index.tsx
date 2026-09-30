import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, GraduationCap, MapPin, Truck } from "lucide-react";

import { DealBanners, TrustBadges } from "@/components/site/Deals";
import { HomeHero, TrustStrip } from "@/components/site/HomeHero";
import { PersonaCard } from "@/components/site/PersonaCard";
import { glassCard, glassPanel, SectionHeading, SetupNotice } from "@/components/site/primitives";
import { ProductCard, ProductGridSkeleton } from "@/components/site/ProductCard";
import { SwipeRow } from "@/components/site/SwipeRow";
import { Button } from "@/components/ui/button";
import { EDUCATION_TOPICS, PERSONAS, STATS } from "@/content/site";
import { formatNaira, lowestPrice } from "@/lib/format";
import { productsQuery } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/_site/")({
  component: HomePage,
});

const CATEGORY_GROUPS = [
  {
    title: "Everyday period care",
    items: [
      { label: "Reusable Menstrual Pads", slug: "reusable-menstrual-pads" },
      { label: "Reusable Pantyliners", slug: "reusable-pantyliners" },
      { label: "Interlabial Pads", slug: "interlabial-pads" },
      { label: "Period Underwear", slug: "period-underwear" },
      { label: "Menstrual Cups", slug: "menstrual-cup" },
    ],
  },
  {
    title: "Cup care",
    items: [
      { label: "Cup Sister", slug: "cup-sister" },
      { label: "Cup Mate", slug: "cup-mate" },
      { label: "Menstrual Cup Sterilizer", slug: "menstrual-cup-sterilizer" },
    ],
  },
  {
    title: "Menstrual health & preparedness",
    items: [
      { label: "My Period Record Book", slug: "my-period-record-book" },
      { label: "Back-to-School Kit", slug: "back-to-school-kit" },
    ],
  },
];

function HomePage() {
  const featured = useQuery(productsQuery({ featured: true }));
  const pads = featured.data?.find((product) => product.slug === "reusable-menstrual-pads");
  const padsFrom = pads ? lowestPrice(pads.product_variants) : null;

  return (
    <>
      <HomeHero />
      <TrustStrip />

      {/* Find your period care */}
      <section id="shop" className="mx-auto max-w-7xl scroll-mt-10 px-5 pb-10 pt-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Smart menstrual choices for confidence, health &amp; everyday life
        </p>
        <h1 className="font-statement mx-auto mt-4 max-w-4xl text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
          Reusable menstrual products in Nigeria for{" "}
          <span className="text-brand">smarter period care</span>
          <span className="text-leaf">.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-foreground/65">
          Your period care should work for your life—not the other way around. Shop reusable pads,
          menstrual cups, period underwear and more, with Lagos pickup or nationwide delivery.
        </p>
        <Button
          asChild
          className="mt-6 h-12 bg-brand px-8 text-sm uppercase tracking-wide text-white hover:bg-primary"
        >
          <Link to="/shop">
            Shop all products <ArrowRight className="size-4" />
          </Link>
        </Button>
        <div className="mt-8 text-left">
          {!isSupabaseConfigured ? (
            <SetupNotice />
          ) : featured.isLoading ? (
            <ProductGridSkeleton count={3} />
          ) : featured.error ? (
            <p className="text-sm text-alert">Couldn't load products: {featured.error.message}</p>
          ) : (
            <SwipeRow label="Featured products" itemClass="w-[72%]">
              {featured.data?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </SwipeRow>
          )}
        </div>
      </section>

      {/* Website-only deals */}
      <section id="deals" className="mx-auto max-w-7xl scroll-mt-10 px-5 py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <SectionHeading eyebrow="Only on our website" title="Website-only deals" />
          <Link
            to="/deals"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            See all deals <ArrowRight className="size-4" />
          </Link>
        </div>
        {isSupabaseConfigured && <DealBanners />}
      </section>

      {/* Trust badges */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className={`${glassCard} px-5 py-9 md:px-10`}>
          <TrustBadges />
        </div>
      </section>

      {/* Find your fit */}
      <section id="fit" className="mx-auto max-w-7xl scroll-mt-36 px-5 py-10">
        <SectionHeading
          eyebrow="Find your fit"
          title="Which menstrual care option is right for you?"
        >
          You don't need to know the name of the product.{" "}
          <strong className="text-foreground">Start with yourself.</strong>
        </SectionHeading>
        <div className="mt-6">
          <SwipeRow label="Find your fit">
            {PERSONAS.map((persona) => (
              <PersonaCard key={persona.id} persona={persona} />
            ))}
          </SwipeRow>
        </div>
      </section>

      {/* Everything you need */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className={`${glassCard} p-7 md:p-10`}>
          <SectionHeading
            eyebrow="Everything you need for your period journey"
            title="Menstrual products, period care & menstrual health tools"
          >
            From reusable sanitary pads and menstrual cups to period underwear, menstrual health
            trackers and first-period products, Sussflow provides practical menstrual care solutions
            for women and girls in Nigeria.
          </SectionHeading>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {CATEGORY_GROUPS.map((group) => (
              <div
                key={group.title}
                className="rounded-3xl border border-glass-border bg-glass-soft p-5"
              >
                <p className="text-xs font-semibold uppercase text-brand">{group.title}</p>
                <ul className="mt-3 space-y-1">
                  {group.items.map((item) => (
                    <li key={item.slug}>
                      <Link
                        to="/products/$slug"
                        params={{ slug: item.slug }}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-glass hover:text-brand"
                      >
                        {item.label} <ArrowRight className="size-4 opacity-50" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reusable pads spotlight */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div
          className={`${glassCard} grid items-center gap-8 p-7 md:grid-cols-[1.05fr_1fr] md:p-10`}
        >
          <div>
            <SectionHeading
              eyebrow="Reusable menstrual pads"
              title="A smarter alternative to disposable sanitary pads."
            >
              For women and girls who want familiar period care with less waste and more reuse.
              Available in 6" to 16" lengths and 3, 5 or 10-in-1 packs to support different flow
              days.
            </SectionHeading>
            <div className="mt-5 flex flex-wrap gap-2 text-sm font-medium">
              <span className="rounded-full border border-glass-border bg-glass-soft px-3 py-1">
                Up to 100 washes
              </span>
              <span className="rounded-full border border-glass-border bg-glass-soft px-3 py-1">
                SON certified
              </span>
              {padsFrom != null && (
                <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-brand">
                  From {formatNaira(padsFrom)}
                </span>
              )}
            </div>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <p className="rounded-2xl border border-glass-border bg-glass-soft p-4">
                <strong className="block">Lagos customers</strong>
                <span className="text-foreground/65">Visit our physical store for pickup.</span>
              </p>
              <p className="rounded-2xl border border-glass-border bg-glass-soft p-4">
                <strong className="block">Outside Lagos</strong>
                <span className="text-foreground/65">
                  We courier and waybill orders nationwide.
                </span>
              </p>
            </div>
            <Button className="mt-6" asChild>
              <Link to="/products/$slug" params={{ slug: "reusable-menstrual-pads" }}>
                Shop reusable pads
              </Link>
            </Button>
          </div>
          <img
            src="/images/pads.jpg"
            width={816}
            height={816}
            loading="lazy"
            alt="Sussflow reusable menstrual pads"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      {/* Bundles teaser */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_1.1fr]">
          <img
            src="/images/kit.jpg"
            width={1120}
            height={1400}
            loading="lazy"
            alt="Sussflow period care bundle"
            className="aspect-[4/3] w-full rounded-[28px] border border-glass-border object-cover shadow-glass"
          />
          <div>
            <SectionHeading
              eyebrow="Find your Sussflow bundle"
              title="Not sure which menstrual products to choose?"
            >
              We've made choosing easier. These aren't just product bundles.{" "}
              <strong className="text-foreground">
                They're designed around different period-care journeys.
              </strong>
            </SectionHeading>
            <div className="mt-5 flex flex-wrap gap-2 text-sm font-medium">
              {[
                "The Curious Switcher",
                "The Pad Girl",
                "The Cup Convert",
                "The Period Peace Kit",
                "The First Period Box",
              ].map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-glass-border bg-glass px-3 py-1"
                >
                  {name}
                </span>
              ))}
            </div>
            <Button className="mt-6" asChild>
              <Link to="/bundles">Explore bundles</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className={`${glassCard} relative overflow-hidden p-7 md:p-10`}>
          <div
            className="absolute -right-20 -top-20 size-72 rounded-full bg-lilac/40 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid gap-8 md:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="More than menstrual products"
                title="Menstrual health education in Nigeria"
              >
                A menstrual product is only part of the solution. Sussflow provides menstrual health
                education and menstrual hygiene sessions for schools, NGOs, communities, workplaces,
                organisations and institutions.
              </SectionHeading>
              <p className="mt-4 font-semibold">
                We've already reached more than 2,000 girls through menstrual health education, with
                10+ NGO partners.
              </p>
              <Button className="mt-6" asChild>
                <Link to="/education">Book a menstrual health session</Link>
              </Button>
            </div>
            <ul className="grid gap-2 self-center sm:grid-cols-2">
              {EDUCATION_TOPICS.map((topic) => (
                <li
                  key={topic}
                  className="flex items-center gap-2 rounded-2xl border border-glass-border bg-glass-soft px-4 py-3 text-sm font-medium"
                >
                  <GraduationCap className="size-4 shrink-0 text-brand" /> {topic}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Why Sussflow */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        <SectionHeading
          eyebrow="Why Sussflow?"
          title="Trusted menstrual care for women & girls in Nigeria"
        />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {STATS.map((stat) => (
            <article key={stat.label} className={`${glassPanel} p-4 sm:p-6`}>
              <p className="font-display text-3xl font-semibold text-brand sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase sm:text-sm">{stat.label}</p>
              <p className="mt-2 text-xs leading-relaxed text-foreground/65 sm:text-sm">
                {stat.body}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <article className={`${glassPanel} flex gap-4 p-6`}>
            <BadgeCheck className="size-8 shrink-0 text-leaf" />
            <div>
              <p className="font-display text-lg font-semibold">Licensed & certified</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/65">
                Sussflow operates as a licensed and certified menstrual health company, committed to
                product quality, safety and responsible manufacturing.
              </p>
            </div>
          </article>
          <article className={`${glassPanel} flex gap-4 p-6`}>
            <Truck className="size-8 shrink-0 text-leaf" />
            <div>
              <p className="font-display text-lg font-semibold">Nationwide delivery</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/65">
                Based in Lagos, Nigeria, we offer physical store pickup in Lagos and courier/waybill
                delivery to customers across Nigeria.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Buy in Lagos & across Nigeria */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className={`${glassCard} p-7 md:p-10`}>
          <SectionHeading
            eyebrow="Visit Sussflow or order online"
            title="Buy menstrual products in Lagos & across Nigeria"
          />
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-glass-border bg-glass-soft p-6">
              <MapPin className="size-6 text-brand" />
              <p className="mt-3 font-display text-lg font-semibold">Lagos pickup</p>
              <p className="mt-1 text-sm text-foreground/65">
                Our physical store is available for customers who prefer to shop and pick up their
                menstrual products in Lagos.
              </p>
              <Button variant="glass" className="mt-4" asChild>
                <Link to="/store-location">Get store location</Link>
              </Button>
            </div>
            <div className="rounded-3xl border border-glass-border bg-glass-soft p-6">
              <Truck className="size-6 text-brand" />
              <p className="mt-3 font-display text-lg font-semibold">Nationwide delivery</p>
              <p className="mt-1 text-sm text-foreground/65">
                Not in Lagos? No problem. We courier and waybill orders to customers across Nigeria.
              </p>
              <Button variant="glass" className="mt-4" asChild>
                <Link to="/shop">Shop online</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Organisations */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <div className={`${glassCard} p-7 md:p-10`}>
            <SectionHeading
              eyebrow="For organisations & institutions"
              title="Take menstrual health beyond a one-time donation."
            >
              Sussflow works with schools, NGOs, CSR teams, organisations and development partners
              to deliver:
            </SectionHeading>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-brand">
              Products + Education + Distribution + Impact
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/65">
              Whether you're supporting 50 girls or 5,000 beneficiaries, we can help you design a
              menstrual health intervention that combines practical menstrual products with
              education and long-term impact.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/education">Partner with Sussflow</Link>
            </Button>
          </div>
          <div className={`${glassCard} p-7 md:p-10`}>
            <SectionHeading
              eyebrow="Your period. Your choice."
              title="There is no single menstrual product that works for everyone."
            />
            <ul className="mt-4 space-y-1 text-sm text-foreground/70">
              <li>Some women prefer reusable pads.</li>
              <li>Some prefer menstrual cups.</li>
              <li>Some prefer period underwear.</li>
              <li>Some use a combination.</li>
            </ul>
            <p className="mt-4 text-sm font-semibold">The goal isn't to tell you what to choose.</p>
            <p className="mt-1 text-sm text-foreground/65">
              It's to help you understand your options so you can choose what works for your body,
              your lifestyle and your cycle.
            </p>
            <Button className="mt-6" variant="glass" asChild>
              <Link to="/find-your-fit">Find my period care</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA — big statement type on a full-bleed brand band */}
      <section className="mt-10 overflow-hidden bg-brand text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5 pb-12 pt-14 md:pb-16 md:pt-20">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lilac">
                Ready to make the switch?
              </p>
              <h2 className="font-statement mt-4 text-[clamp(3.5rem,11vw,9.5rem)] leading-[0.85]">
                Choose
                <br />
                yourself<span className="text-leaf">.</span>
              </h2>
            </div>
            <div className="md:pb-3">
              <p className="text-lg leading-relaxed text-primary-foreground/85">
                Your period isn't a problem to solve. It's a part of your life to understand,
                prepare for and care for.
              </p>
              <p className="mt-4 font-semibold">
                Choose reusable. Choose informed. Choose what works for you.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="bg-primary-foreground text-brand hover:bg-lilac hover:text-primary"
                >
                  <Link to="/find-your-fit">Find your period care</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:border-primary-foreground hover:text-primary-foreground"
                >
                  <Link to="/shop">Shop Sussflow</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
