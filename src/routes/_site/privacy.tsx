import { createFileRoute } from "@tanstack/react-router";

import { ContactLine, LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/_site/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy | Sussflow" },
      {
        name: "description",
        content: "How Sussflow collects, uses and protects your personal data.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy policy"
      title="Your privacy matters"
      updated="30 September 2026"
      intro="This policy explains how Sussflow Reusable Nigeria Limited collects and uses your personal data, in line with the Nigeria Data Protection Act 2023."
      sections={[
        {
          title: "What we collect",
          body: (
            <ul>
              <li>
                <strong>Order details:</strong> your name, email, phone number, delivery address and
                the items you buy.
              </li>
              <li>
                <strong>Account details:</strong> if you create an account, your email, name and a
                securely hashed password.
              </li>
              <li>
                <strong>Messages and applications:</strong> what you send us through our forms
                (sessions, partnerships, stockists, distributors).
              </li>
              <li>
                <strong>Email list:</strong> your email address if you sign up for deals and news.
              </li>
              <li>
                <strong>Device storage:</strong> your bag and sign-in are remembered in your
                browser's local storage. We don't use advertising cookies.
              </li>
            </ul>
          ),
        },
        {
          title: "How we use it",
          body: (
            <ul>
              <li>To process, deliver and support your orders (performing our contract with you).</li>
              <li>To reply to your messages and applications.</li>
              <li>To send deals and news if you've signed up (your consent; you can opt out any time).</li>
              <li>To keep the website secure and prevent fraud (our legitimate interests).</li>
              <li>To meet our legal and tax obligations.</li>
            </ul>
          ),
        },
        {
          title: "Who we share it with",
          body: (
            <>
              <p>We never sell your data. We share only what's needed with:</p>
              <ul>
                <li>Paystack, to process payments. Your card details go to Paystack, not us.</li>
                <li>Supabase and Vercel, who securely host our database and website.</li>
                <li>Dispatch riders and couriers, to deliver your order.</li>
                <li>Authorities, when the law requires it.</li>
              </ul>
              <p>
                Some of these providers may process data outside Nigeria. When they do, we rely on
                the safeguards required by the Nigeria Data Protection Act.
              </p>
            </>
          ),
        },
        {
          title: "How long we keep it",
          body: (
            <p>
              We keep order records for as long as needed for accounting and legal purposes, and
              other data only as long as we need it for the reason we collected it. You can ask us
              to delete your account at any time.
            </p>
          ),
        },
        {
          title: "Your rights",
          body: (
            <>
              <p>You have the right to:</p>
              <ul>
                <li>access the personal data we hold about you;</li>
                <li>correct it if it's wrong;</li>
                <li>ask us to delete it, or to limit how we use it;</li>
                <li>object to marketing and withdraw consent at any time;</li>
                <li>receive your data in a portable format;</li>
                <li>
                  complain to the Nigeria Data Protection Commission if you're unhappy with how we
                  handle your data.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Keeping your data safe",
          body: (
            <p>
              Our site uses HTTPS encryption, payments are handled by Paystack, passwords are hashed
              and never stored in plain text, and only authorised staff can see order details.
            </p>
          ),
        },
        {
          title: "Children",
          body: (
            <p>
              Products such as the First Period Box are bought by parents and guardians. We don't
              knowingly collect personal data directly from children under 13.
            </p>
          ),
        },
        {
          title: "Contact us",
          body: (
            <p>
              To use your rights or ask a question about privacy, <ContactLine />. We'll respond
              within the timeframes set by law.
            </p>
          ),
        },
      ]}
    />
  );
}
