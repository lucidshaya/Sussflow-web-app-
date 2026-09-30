import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Ruler } from "lucide-react";

import { glassCard, PageHero, SectionHeading } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { settingsQuery } from "@/lib/queries";
import { whatsappHref } from "@/lib/whatsapp";

export const Route = createFileRoute("/_site/size-guide")({
  head: () => ({
    meta: [
      { title: "Size guide | Sussflow reusable pads, pants & cups" },
      {
        name: "description",
        content:
          "Choose the right Sussflow reusable pad length (6\" to 16\"), period underwear size and menstrual cup for your flow.",
      },
    ],
  }),
  component: SizeGuidePage,
});

const PAD_SIZES = [
  { length: '6"', cm: "about 15 cm", flow: "Spotting & very light days", use: "Pantyliner days, end of period, backup with a cup" },
  { length: '8"', cm: "about 20 cm", flow: "Light flow", use: "Lighter days and everyday freshness" },
  { length: '10"', cm: "about 25 cm", flow: "Light to moderate", use: "Everyday wear on regular days" },
  { length: '12"', cm: "about 30 cm", flow: "Moderate flow", use: "Your usual day-time pad" },
  { length: '14"', cm: "about 36 cm", flow: "Heavy flow", use: "Heavy days and longer wear" },
  { length: '16"', cm: "about 41 cm", flow: "Heaviest flow & overnight", use: "Nights, heavy days and postpartum" },
];

function SizeGuidePage() {
  const { data: settings } = useQuery(settingsQuery);
  const chat = whatsappHref(settings?.whatsapp_url, settings?.contact_phone);

  return (
    <>
      <PageHero eyebrow="Size guide" title="Find your fit, size by size">
        Pick pad lengths by flow, choose your usual underwear size and find the right cup. Not
        sure? Message us and we'll help.
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className={`${glassCard} p-6 md:p-10`}>
          <SectionHeading eyebrow="Reusable pads" title="Pad lengths by flow">
            Longer pads give more coverage. Most people mix two or three lengths across their
            cycle: a longer pad for heavy days and nights, a shorter one for lighter days.
          </SectionHeading>

          {/* Table on larger screens, cards on phones */}
          <div className="mt-6 hidden overflow-hidden rounded-3xl border border-glass-border md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-glass-soft text-xs uppercase text-foreground/60">
                <tr>
                  <th className="px-5 py-3">Length</th>
                  <th className="px-5 py-3">Approx.</th>
                  <th className="px-5 py-3">Best for</th>
                  <th className="px-5 py-3">When to use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {PAD_SIZES.map((size) => (
                  <tr key={size.length}>
                    <td className="px-5 py-3 font-display text-lg font-semibold text-brand">
                      {size.length}
                    </td>
                    <td className="px-5 py-3 text-foreground/65">{size.cm}</td>
                    <td className="px-5 py-3 font-medium">{size.flow}</td>
                    <td className="px-5 py-3 text-foreground/70">{size.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-6 grid gap-3 md:hidden">
            {PAD_SIZES.map((size) => (
              <li
                key={size.length}
                className="flex gap-4 rounded-2xl border border-glass-border bg-glass-soft p-4"
              >
                <span className="font-display text-2xl font-semibold text-brand">
                  {size.length}
                </span>
                <span className="text-sm">
                  <span className="block font-semibold">{size.flow}</span>
                  <span className="block text-foreground/65">{size.use}</span>
                  <span className="block text-xs text-foreground/50">{size.cm}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-foreground/65">
            For heavy flow we recommend 14" or 16". New mums: our longest 16" pad gives the most
            coverage after birth.
          </p>
          <Button asChild className="mt-5">
            <Link to="/products/$slug" params={{ slug: "reusable-menstrual-pads" }}>
              Shop reusable pads
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:grid-cols-2">
        <div className={`${glassCard} p-6 md:p-8`}>
          <Ruler className="size-6 text-brand" />
          <h2 className="mt-3 font-display text-2xl font-semibold">Period underwear</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            Choose the size you usually wear in everyday underwear. Between sizes? Go for the larger
            one for comfort. Add your size in the order notes at checkout and we'll confirm it
            before we pack your order.
          </p>
          <Button asChild variant="glass" className="mt-5">
            <Link to="/products/$slug" params={{ slug: "period-underwear" }}>
              Shop period underwear
            </Link>
          </Button>
        </div>
        <div className={`${glassCard} p-6 md:p-8`}>
          <Ruler className="size-6 text-brand" />
          <h2 className="mt-3 font-display text-2xl font-semibold">Menstrual cup</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            Our medical-grade silicone cup can be worn for up to 12 hours and lasts 5 to 10 years.
            First time with a cup? Our Cup Sister and Cup Mate help with the transition. Ask us if
            you're unsure which setup suits you.
          </p>
          <Button asChild variant="glass" className="mt-5">
            <Link to="/products/$slug" params={{ slug: "menstrual-cup" }}>
              Shop the menstrual cup
            </Link>
          </Button>
        </div>
      </section>

      {chat && (
        <section className="mx-auto max-w-7xl px-5 pb-8">
          <div className={`${glassCard} flex flex-wrap items-center justify-between gap-4 p-6`}>
            <p className="font-semibold">Still unsure about sizing? We're happy to help.</p>
            <Button asChild>
              <a href={chat} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" /> Ask us on WhatsApp
              </a>
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
