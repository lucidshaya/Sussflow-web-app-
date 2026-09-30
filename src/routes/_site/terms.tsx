import { createFileRoute, Link } from "@tanstack/react-router";

import { ContactLine, LegalPage } from "@/components/site/LegalPage";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/terms")({
  head: () =>
    seo({
      title: "Terms & conditions | Sussflow",
      description: "The terms that apply when you shop with Sussflow.",
      path: "/terms",
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms & conditions"
      title="Terms of sale"
      updated="30 September 2026"
      intro="These terms apply when you browse this website or buy from Sussflow Reusable Nigeria Limited (“Sussflow”, “we”, “us”). By placing an order you agree to them."
      sections={[
        {
          title: "Who we are",
          body: (
            <p>
              Sussflow Reusable Nigeria Limited is a menstrual health company based in Lagos,
              Nigeria. We sell reusable menstrual products and provide menstrual health education.
            </p>
          ),
        },
        {
          title: "Orders and prices",
          body: (
            <>
              <p>
                All prices are in Nigerian Naira (₦) and are shown on the website at the time you
                order. Your order is confirmed once payment is successful and you receive an order
                number.
              </p>
              <p>
                We check every price when you check out, so the amount you pay always matches the
                current price on the site. If an item sells out or a clear pricing error occurs, we
                will contact you and offer a refund or an alternative.
              </p>
            </>
          ),
        },
        {
          title: "Website-only deals",
          body: (
            <p>
              Deals marked “website-only” are available on this site while stock lasts and may end
              at any time. Deals can't be exchanged for cash and apply only to the items listed.
            </p>
          ),
        },
        {
          title: "Payment",
          body: (
            <p>
              Payments are processed securely by Paystack. We never see or store your full card
              details. Any fees shown on the Paystack checkout are charged by the payment provider.
            </p>
          ),
        },
        {
          title: "Delivery and pickup",
          body: (
            <ul>
              <li>
                <strong>Lagos pickup:</strong> collect your order from our pickup point once we tell
                you it's ready.
              </li>
              <li>
                <strong>Nationwide delivery:</strong> we send orders by dispatch rider in Lagos and
                by courier or waybill elsewhere. Delivery fees and timelines are confirmed with you
                after your order.
              </li>
              <li>
                You can follow your order on the{" "}
                <Link to="/track" className="font-semibold text-brand underline">
                  Track your order
                </Link>{" "}
                page.
              </li>
            </ul>
          ),
        },
        {
          title: "Returns, hygiene and faulty items",
          body: (
            <>
              <p>
                For hygiene reasons, we can't accept returns of menstrual products that have been
                opened or used, unless they are faulty.
              </p>
              <p>
                If an item arrives damaged, faulty or not what you ordered, contact us within 7 days
                of receiving it with your order number and a photo. We'll replace it or refund you.
              </p>
            </>
          ),
        },
        {
          title: "Using our products",
          body: (
            <p>
              Follow the care and use instructions for each product. Our products and information
              are not medical advice. If you have a medical condition, unusual pain or bleeding,
              speak to a healthcare professional. Combining products can add protection, but no
              period product can guarantee that leaks will never happen.
            </p>
          ),
        },
        {
          title: "Your account",
          body: (
            <p>
              You're responsible for keeping your password safe. Tell us straight away if you think
              someone else has used your account.
            </p>
          ),
        },
        {
          title: "Our content",
          body: (
            <p>
              The Sussflow name, logo, photos and text on this site belong to Sussflow and may not
              be copied or used without our written permission.
            </p>
          ),
        },
        {
          title: "Liability",
          body: (
            <p>
              Nothing in these terms limits your rights under Nigerian consumer protection law,
              including the Federal Competition and Consumer Protection Act 2018. Otherwise, our
              liability for any order is limited to the amount you paid for it.
            </p>
          ),
        },
        {
          title: "Governing law",
          body: <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>,
        },
        {
          title: "Changes and contact",
          body: (
            <p>
              We may update these terms from time to time; the date at the top shows the latest
              version. Questions? <ContactLine />.
            </p>
          ),
        },
      ]}
    />
  );
}
