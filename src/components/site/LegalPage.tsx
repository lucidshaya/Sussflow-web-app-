import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { settingsQuery } from "@/lib/queries";
import { whatsappHref } from "@/lib/whatsapp";

import { glassCard, PageHero } from "./primitives";

export interface LegalSection {
  title: string;
  body: ReactNode;
}

/** Long-form policy page with a table of contents that works on phones. */
export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  const id = (i: number) => `section-${i + 1}`;
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title}>
        <span className="block text-sm text-foreground/55">Last updated {updated}</span>
        <span className="mt-2 block">{intro}</span>
      </PageHero>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[16rem_1fr] [&>*]:min-w-0">
        <nav aria-label="Contents" className={`${glassCard} h-fit p-5 lg:sticky lg:top-36`}>
          <p className="text-xs font-semibold uppercase text-brand">Contents</p>
          <ol className="mt-3 space-y-1.5 text-sm">
            {sections.map((section, i) => (
              <li key={section.title}>
                <a href={`#${id(i)}`} className="text-foreground/70 hover:text-brand">
                  {i + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className={`${glassCard} space-y-8 p-6 md:p-10`}>
          {sections.map((section, i) => (
            <article key={section.title} id={id(i)} className="scroll-mt-36">
              <h2 className="font-display text-xl font-semibold">
                {i + 1}. {section.title}
              </h2>
              <div className="mt-3 space-y-3 leading-relaxed text-foreground/75 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
                {section.body}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

/** "Email … or WhatsApp …" using the contact details from Admin → Settings. */
export function ContactLine() {
  const { data: settings } = useQuery(settingsQuery);
  const chat = whatsappHref(settings?.whatsapp_url, settings?.contact_phone);
  return (
    <>
      {settings?.contact_email && (
        <>
          email{" "}
          <a className="font-semibold text-brand underline" href={`mailto:${settings.contact_email}`}>
            {settings.contact_email}
          </a>
          {chat ? " or " : ""}
        </>
      )}
      {chat && (
        <>
          message us on{" "}
          <a className="font-semibold text-brand underline" href={chat} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </>
      )}
      {!settings?.contact_email && !chat && "contact us through the website"}
    </>
  );
}
