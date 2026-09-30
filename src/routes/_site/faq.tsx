import { createFileRoute, Link } from "@tanstack/react-router";

import { glassCard, PageHero } from "@/components/site/primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FAQ_GROUPS } from "@/content/site";
import { faqJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/faq")({
  head: () =>
    seo({
      title: "FAQs — Reusable Pads, Menstrual Cups & Period Underwear | Sussflow",
      description:
        "Answers about reusable menstrual pads, period underwear, menstrual cups, first-period products, delivery across Nigeria and Lagos pickup.",
      path: "/faq",
      jsonLd: [faqJsonLd(FAQ_GROUPS.flatMap((group) => group.items))],
    }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Frequently asked questions"
        title="Everything you want to know about reusable period care"
      >
        Can't find your answer? We're happy to help you find the menstrual product that fits your
        body, lifestyle and cycle.
      </PageHero>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[240px_1fr]">
        <nav className="hidden lg:block" aria-label="FAQ sections">
          <ul className="sticky top-36 space-y-1 text-sm font-medium">
            {FAQ_GROUPS.map((group) => (
              <li key={group.id}>
                <a
                  href={`#${group.id}`}
                  className="block rounded-xl px-3 py-2 text-foreground/70 hover:bg-glass hover:text-brand"
                >
                  {group.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-6">
          {FAQ_GROUPS.map((group) => (
            <section
              key={group.id}
              id={group.id}
              className={`${glassCard} scroll-mt-36 p-6 md:p-8`}
            >
              <h2 className="font-display text-2xl font-semibold">{group.title}</h2>
              <Accordion type="multiple" className="mt-3">
                {group.items.map((item) => (
                  <AccordionItem key={item.q} value={item.q} className="border-foreground/10">
                    <AccordionTrigger className="text-left font-semibold hover:text-brand hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 leading-relaxed text-foreground/70">
                      {item.a.map((para) => (
                        <p key={para}>{para}</p>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
          <div className={`${glassCard} p-7 text-center md:p-10`}>
            <h2 className="font-display text-2xl font-semibold">Still have questions?</h2>
            <p className="mt-2 text-foreground/65">
              We're happy to help you find the menstrual product that fits your body, lifestyle and
              cycle.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/store-location" hash="contact">
                  Chat with us
                </Link>
              </Button>
              <Button asChild variant="glass">
                <Link to="/shop">Shop Sussflow</Link>
              </Button>
              <Button asChild variant="glass">
                <Link to="/find-your-fit">Find your period care</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
