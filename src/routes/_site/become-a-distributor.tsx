import { createFileRoute } from "@tanstack/react-router";

import { TradePage } from "@/components/site/TradePage";

export const Route = createFileRoute("/_site/become-a-distributor")({
  head: () => ({
    meta: [
      { title: "Become a distributor | Sussflow" },
      {
        name: "description",
        content:
          "Apply to become a Sussflow distributor and bring reusable period care to more women and girls in Nigeria.",
      },
    ],
  }),
  component: () => <TradePage type="distributor" />,
});
