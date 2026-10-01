import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone, Store, Truck } from "lucide-react";

import { EnquiryForm } from "@/components/site/EnquiryForm";
import { glassCard, PageHero, SectionHeading } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { whatsappHref } from "@/lib/whatsapp";
import { settingsQuery } from "@/lib/queries";
import { DeliveryRates } from "@/components/site/DeliveryRates";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/store-location")({
  head: () =>
    seo({
      title: "Buy Menstrual Products in Lagos & Across Nigeria | Sussflow",
      description:
        "Pick up reusable pads and menstrual cups from our Iju-axis Lagos store, or order online for nationwide courier and waybill delivery.",
      path: "/store-location",
    }),
  component: StoreLocationPage,
});

function StoreLocationPage() {
  const { data: settings } = useQuery(settingsQuery);
  const waHref = whatsappHref(settings?.whatsapp_url, settings?.contact_phone);

  return (
    <>
      <PageHero
        eyebrow="Visit Sussflow or order online"
        title="Buy menstrual products in Lagos & across Nigeria"
      />
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:grid-cols-3">
        <div className={`${glassCard} p-7`}>
          <MapPin className="size-7 text-brand" />
          <h2 className="mt-3 font-display text-xl font-semibold">Lagos pickup</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/65">
            Our physical store is available for customers who prefer to shop and pick up their
            menstrual products in Lagos.
          </p>
          <p className="mt-3 rounded-2xl border border-glass-border bg-glass-soft p-4 text-sm font-semibold">
            {settings?.pickup_address ?? "Iju axis, Lagos, Nigeria"}
          </p>
          {settings?.pickup_instructions && (
            <p className="mt-2 text-sm text-foreground/65">{settings.pickup_instructions}</p>
          )}
          <p className="mt-3 text-xs text-foreground/55">
            Order online and choose “Lagos pickup” at checkout — we'll confirm when it's ready.
          </p>
        </div>
        <div className={`${glassCard} p-7`}>
          <Truck className="size-7 text-brand" />
          <h2 className="mt-3 font-display text-xl font-semibold">Nationwide delivery</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/65">
            Not in Lagos? No problem. We courier and waybill orders to customers across Nigeria.
            Lagos deliveries are generally handled through dispatch.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/65">
            Delivery fees are shown at checkout under your subtotal and paid online together with
            your order, so there's nothing extra to pay on arrival.
          </p>
          <DeliveryRates className="mt-4" />
          <Button asChild className="mt-4">
            <Link to="/shop">Shop online</Link>
          </Button>
        </div>
        <div className={`${glassCard} p-7`}>
          <Store className="size-7 text-brand" />
          <h2 className="mt-3 font-display text-xl font-semibold">Coming soon: more stores</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/65">
            We're working towards making Sussflow menstrual products available in more physical
            stores, bringing reusable period care closer to you.
          </p>
          <Button asChild variant="glass" className="mt-4">
            <a href="#contact">Join the waitlist</a>
          </Button>
        </div>
      </section>

      <section
        id="contact"
        className="mx-auto grid max-w-7xl scroll-mt-36 gap-6 px-5 py-8 md:grid-cols-[1fr_1.4fr]"
      >
        <div className={`${glassCard} p-7`}>
          <SectionHeading eyebrow="Still have questions?" title="Chat with us" />
          <ul className="mt-5 space-y-3 text-sm">
            {waHref && (
              <li>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 font-semibold hover:text-brand"
                >
                  <MessageCircle className="size-4 text-leaf" /> Chat on WhatsApp
                </a>
              </li>
            )}
            {settings?.contact_phone && (
              <li>
                <a
                  href={`tel:${settings.contact_phone}`}
                  className="flex items-center gap-2 font-semibold hover:text-brand"
                >
                  <Phone className="size-4 text-leaf" /> {settings.contact_phone}
                </a>
              </li>
            )}
            {settings?.contact_email && (
              <li>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="flex items-center gap-2 font-semibold hover:text-brand"
                >
                  <Mail className="size-4 text-leaf" /> {settings.contact_email}
                </a>
              </li>
            )}
            <li className="text-foreground/65">Or send us a message and we'll get back to you.</li>
          </ul>
        </div>
        <div className={`${glassCard} p-7`}>
          <EnquiryForm types={["contact", "waitlist"]} showOrganisation={false} />
        </div>
      </section>
    </>
  );
}
