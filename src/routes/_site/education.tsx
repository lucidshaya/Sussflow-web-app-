import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, HandHeart, Package, Truck } from "lucide-react";

import { EnquiryForm } from "@/components/site/EnquiryForm";
import { glassCard, glassPanel, PageHero, SectionHeading } from "@/components/site/primitives";
import { EDUCATION_TOPICS, STATS } from "@/content/site";
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
