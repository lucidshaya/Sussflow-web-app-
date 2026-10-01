import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, GraduationCap, HandHeart, Package, Quote, Truck } from "lucide-react";

import { EnquiryForm } from "@/components/site/EnquiryForm";
import { glassCard, glassPanel, PageHero, SectionHeading } from "@/components/site/primitives";
import { SwipeRow } from "@/components/site/SwipeRow";
import { EDUCATION_TOPICS, IMPACT_HIGHLIGHTS, IMPACT_PHOTOS, REVIEWS, STATS } from "@/content/site";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/education")({
  head: () =>
    seo({
      title: "Menstrual Health Education & Partnerships in Nigeria | Sussflow",
      description:
        "Menstrual health education and menstrual hygiene sessions for schools, NGOs, communities and organisations in Nigeria. Partner with Sussflow on sustainable menstrual health interventions.",
      path: "/education",
    }),
  component: EducationPage,
});

const PILLARS = [
  {
    icon: Package,
    title: "Products",
    body: "Reusable pads, period underwear and first-period kits that last.",
  },
  {
    icon: GraduationCap,
    title: "Education",
    body: "Age-appropriate menstrual health and hygiene sessions.",
  },
  {
    icon: Truck,
    title: "Distribution",
    body: "Delivery to schools and communities across Nigeria.",
  },
  {
    icon: HandHeart,
    title: "Impact",
    body: "Long-term menstrual health outcomes, not a one-time donation.",
  },
];

function EducationPage() {
  return (
    <>
      <PageHero
        eyebrow="More than menstrual products"
        title="Menstrual health education in Nigeria"
      >
        A menstrual product is only part of the solution. Sussflow provides menstrual health
        education and menstrual hygiene sessions for schools, NGOs, communities, workplaces,
        organisations and institutions.
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className={`${glassPanel} p-4 sm:p-6`}>
              <p className="font-display text-3xl font-semibold text-brand sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <SectionHeading
          eyebrow="Where we've been"
          title="Schools, communities and partners we've worked with"
        >
          Real moments from our outreach: International Day of the Girl Child school visits, pad
          distributions, workshops and events across Lagos and Ogun States.
        </SectionHeading>
        <div className="mt-6">
          <SwipeRow label="Photos from Sussflow outreach" itemClass="w-[82%]">
            {IMPACT_PHOTOS.map((photo) => (
              <figure key={photo.src} className={`${glassPanel} overflow-hidden`}>
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover object-top"
                />
                <figcaption className="p-4 text-sm font-medium leading-snug text-foreground/75">
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </SwipeRow>
        </div>
        <ul className={`${glassCard} mt-6 grid gap-3 p-6 sm:grid-cols-2 md:p-8`}>
          {IMPACT_HIGHLIGHTS.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-relaxed">
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-leaf" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:grid-cols-2">
        <div className={`${glassCard} p-7 md:p-10`}>
          <SectionHeading
            eyebrow="Our sessions can cover"
            title="Practical, stigma-free menstrual health knowledge"
          />
          <ul className="mt-5 grid gap-2">
            {EDUCATION_TOPICS.map((topic) => (
              <li
                key={topic}
                className="flex items-center gap-2 rounded-2xl border border-glass-border bg-glass-soft px-4 py-3 text-sm font-medium"
              >
                <GraduationCap className="size-4 shrink-0 text-brand" /> {topic}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-relaxed text-foreground/70">
            We've already reached more than 2,000 girls and partnered with 10+ NGOs. Now we're
            helping more schools, organisations and communities build better menstrual health
            knowledge.
          </p>
        </div>
        <div className={`${glassCard} p-7 md:p-10`}>
          <SectionHeading
            eyebrow="For organisations & institutions"
            title="Take menstrual health beyond a one-time donation."
          >
            Whether you're supporting 50 girls or 5,000 beneficiaries, we can help you design a
            menstrual health intervention that combines practical menstrual products with education
            and long-term impact.
          </SectionHeading>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-glass-border bg-glass-soft p-4">
                <Icon className="size-5 text-leaf" />
                <p className="mt-2 font-semibold">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-foreground/65">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <SectionHeading eyebrow="Reviews" title="What women say after switching to Sussflow" />
        <div className="mt-6">
          <SwipeRow label="Customer reviews" itemClass="w-[85%]">
            {REVIEWS.map((review) => (
              <figure
                key={review.name + review.quote}
                className={`${glassPanel} flex flex-col p-6`}
              >
                <Quote className="size-6 text-brand" aria-hidden="true" />
                <blockquote className="mt-3 flex-1 leading-relaxed text-foreground/80">
                  {review.quote}
                </blockquote>
                <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{review.name}</span>
                  <span className="rounded-full border border-glass-border bg-glass-soft px-3 py-1 text-xs font-medium text-foreground/70">
                    {review.product}
                  </span>
                </figcaption>
              </figure>
            ))}
          </SwipeRow>
        </div>
      </section>

      <section id="book" className="mx-auto max-w-3xl scroll-mt-36 px-5 py-8">
        <div className={`${glassCard} p-7 md:p-10`}>
          <SectionHeading
            eyebrow="Work with Sussflow"
            title="Book a session or start a partnership"
          />
          <div className="mt-6">
            <EnquiryForm types={["session", "partnership"]} />
          </div>
        </div>
      </section>
    </>
  );
}
