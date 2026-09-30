import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";

import { CartDrawer } from "@/components/site/CartDrawer";
import { AnnouncementBar } from "@/components/site/HomeHero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  const isHome = useRouterState({ select: (s) => s.location.pathname === "/" });

  return (
    <div className="page-atmosphere min-h-screen overflow-x-clip text-foreground">
      {isHome ? (
        <>
          <AnnouncementBar />
          <div className="relative">
            {/* The home hero sits under a floating header, like a magazine cover. */}
            <SiteHeader variant="overlay" />
            <main>
              <Outlet />
            </main>
          </div>
        </>
      ) : (
        <>
          <SiteHeader />
          <main>
            <Outlet />
          </main>
        </>
      )}
      <SiteFooter />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
