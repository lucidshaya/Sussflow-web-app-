import { createFileRoute } from "@tanstack/react-router";

import { TradePage } from "@/components/site/TradePage";

export const Route = createFileRoute("/_site/become-a-stockist")({
  head: () => ({
    meta: [
      { title: "Become a stockist | Sussflow" },
      {
        name: "description",
        content: "Apply to become a Sussflow stockist and bring reusable period care to more women and girls in Nigeria.",
      },
    ],
  }),
  component: () => <TradePage type="stockist" />,
});
