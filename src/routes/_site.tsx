import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { CartDrawer } from "@/components/site/CartDrawer";
import { AnnouncementBar } from "@/components/site/HomeHero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

/**
 * If Supabase sends a password-reset link to the Site URL instead of /reset-password
 * (its fallback when the redirect isn't allow-listed), forward it to the reset page.
 */
function useRecoveryRedirect() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (pathname === "/reset-password" || !isSupabaseConfigured) return;
    const { hash, search } = window.location;
    const isRecovery =
      /(^|[#&])type=recovery(&|$)/.test(hash) || /[?&]type=recovery(&|$)/.test(search);
    // Tokens still in the URL: hand them to the reset page as-is.
    if (isRecovery) {
      window.location.replace(`/reset-password${search}${hash}`);
      return;
    }
    // Supabase already consumed the link and signed the person in for recovery.
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") void navigate({ to: "/reset-password", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [pathname, navigate]);
}

function SiteLayout() {
  useRecoveryRedirect();
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
