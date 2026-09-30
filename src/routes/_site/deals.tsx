import { createFileRoute, Link } from "@tanstack/react-router";

import { DealBanners, TrustBadges } from "@/components/site/Deals";
import { glassCard, PageHero, SetupNotice } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { prefetch, productsQuery } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/deals")({
  loader: ({ context: { queryClient } }) => prefetch(queryClient, productsQuery()),
  head: () =>
    seo({
      title: "Website-only deals | Sussflow",
      description:
        "Website-only Sussflow deals on period pants, reusable pad 10-packs, menstrual cup bundles and the Back-to-School Kit.",
      path: "/deals",
    }),
  component: DealsPage,
});

function DealsPage() {
  return (
    <>
      <PageHero eyebrow="Website-only deals" title="Deals you'll only find here">
        Bundle up and save on reusable period care. Prices are shown in your bag and charged
        securely with Paystack.
      </PageHero>
      <section className="mx-auto max-w-7xl px-5 py-8">
        {isSupabaseConfigured ? <DealBanners /> : <SetupNotice what="the deals" />}
      </section>
      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className={`${glassCard} px-5 py-9 md:px-10`}>
          <TrustBadges />
        </div>
        <div className="mt-8 flex justify-center">
          <Button asChild variant="glass">
            <Link to="/shop">Shop everything</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
