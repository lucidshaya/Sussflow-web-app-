import {
  BadgeCheck,
  GraduationCap,
  Handshake,
  Package,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { EnquiryForm } from "./EnquiryForm";
import { glassCard, glassPanel, PageHero, SectionHeading } from "./primitives";

const COPY = {
  stockist: {
    eyebrow: "Become a stockist",
    title: "Stock Sussflow in your store",
    intro:
      "Pharmacies, supermarkets, salons, school shops and online stores: bring reusable period care to your customers with a trusted Nigerian brand.",
    perks: [
      { icon: BadgeCheck, title: "SON-certified pads", body: "Products your customers can trust." },
      { icon: Package, title: "Trade pricing", body: "Wholesale rates on pads, pants and cups." },
      {
        icon: GraduationCap,
        title: "Product training",
        body: "We show your team how to explain reusable care.",
      },
      { icon: Truck, title: "Reliable restocks", body: "Lagos dispatch and nationwide waybill." },
    ],
    formTitle: "Apply to become a stockist",
  },
  distributor: {
    eyebrow: "Become a distributor",
    title: "Distribute Sussflow in your region",
    intro:
      "Help us reach more women and girls across Nigeria. We're partnering with distributors who can supply retailers, schools and organisations in their state or region.",
    perks: [
      {
        icon: Handshake,
        title: "Regional partnership",
        body: "Grow reusable period care where you are.",
      },
      { icon: Package, title: "Volume pricing", body: "Distributor rates on bulk orders." },
      {
        icon: GraduationCap,
        title: "Marketing & education support",
        body: "Materials and menstrual health know-how.",
      },
      {
        icon: BadgeCheck,
        title: "Quality products",
        body: "Medical-grade, sustainable materials.",
      },
    ],
    formTitle: "Apply to become a distributor",
  },
} satisfies Record<
  string,
  {
    eyebrow: string;
    title: string;
    intro: string;
    perks: { icon: LucideIcon; title: string; body: string }[];
    formTitle: string;
  }
>;

/** Shared layout for the stockist and distributor application pages. */
export function TradePage({ type }: { type: keyof typeof COPY }) {
  const copy = COPY[type];
  return (
    <>
      <PageHero eyebrow={copy.eyebrow} title={copy.title}>
        {copy.intro}
      </PageHero>
      <section className="mx-auto max-w-7xl px-5 py-8">
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {copy.perks.map(({ icon: Icon, title, body }) => (
            <li key={title} className={`${glassPanel} p-4 sm:p-6`}>
              <Icon className="size-6 text-brand" />
              <p className="mt-3 text-sm font-semibold sm:text-base">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-foreground/65 sm:text-sm">{body}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="mx-auto max-w-3xl px-5 py-8">
        <div className={`${glassCard} p-6 md:p-10`}>
          <SectionHeading eyebrow="Tell us about your business" title={copy.formTitle}>
            We'll review your application and get back to you within a few working days.
          </SectionHeading>
          <div className="mt-6">
            <EnquiryForm types={[type]} />
          </div>
        </div>
      </section>
    </>
  );
}
