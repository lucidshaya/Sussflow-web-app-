import { createFileRoute } from "@tanstack/react-router";

import { TradePage } from "@/components/site/TradePage";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/become-a-stockist")({
  head: () =>
    seo({
      title: "Become a stockist | Sussflow",
      description:
        "Apply to become a Sussflow stockist and bring reusable period care to more women and girls in Nigeria.",
      path: "/become-a-stockist",
    }),
  component: () => <TradePage type="stockist" />,
});
