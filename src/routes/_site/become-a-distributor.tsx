import { createFileRoute } from "@tanstack/react-router";

import { TradePage } from "@/components/site/TradePage";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/become-a-distributor")({
  head: () =>
    seo({
      title: "Become a distributor | Sussflow",
      description:
        "Apply to become a Sussflow distributor and bring reusable period care to more women and girls in Nigeria.",
      path: "/become-a-distributor",
    }),
  component: () => <TradePage type="distributor" />,
});
