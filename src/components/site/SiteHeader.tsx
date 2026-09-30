import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

import logoFull from "@/assets/sussflow-logo.png";
import { cn } from "@/lib/utils";

import { Logo } from "./primitives";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/deals", label: "Deals" },
  { to: "/bundles", label: "Bundles" },
  { to: "/find-your-fit", label: "Find your fit" },
  { to: "/education", label: "Education" },
  { to: "/faq", label: "FAQs" },
] as const;

const MARQUEE =
  "Website-only deals on period pants, pad 10-packs & cup bundles · Lagos pickup (Iju axis) · Nationwide courier & waybill delivery · SON-certified reusable pads · Up to 100 washes per pad · Menstrual health education for schools & NGOs · 700+ customers served ·";

export function SiteHeader({ variant = "default" }: { variant?: "default" | "overlay" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, setOpen } = useCart();
  const { user, isAdmin } = useAuth();

  if (variant === "overlay") {
    return (
      <header className="absolute inset-x-0 top-0 z-40 px-4 pt-5 sm:px-8 sm:pt-7">
        <div className="mx-auto flex max-w-[1500px] items-start justify-between gap-4">
          <Link to="/" aria-label="Sussflow home" className="shrink-0">
            <img
              src={logoFull}
              alt="Sussflow"
              width={1063}
              height={515}
              className="h-14 w-auto drop-shadow-[0_2px_12px_rgba(255,255,255,0.65)] sm:h-24 lg:h-32"
            />
          </Link>
          <div className="flex items-center gap-1 rounded-full bg-brand px-2 py-1.5 text-primary-foreground shadow-glass sm:px-4 sm:py-2">
            <nav className="hidden items-center lg:flex" aria-label="Main navigation">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-white/15"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {headerIcons(true)}
          </div>
        </div>
        {menuOpen && <MobileNav onClose={() => setMenuOpen(false)} isAdmin={isAdmin} />}
      </header>
    );
  }

  function headerIcons(overlay: boolean) {
    const icon = overlay
      ? "text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
      : "";
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            asChild
            className={cn("hidden size-10 sm:inline-flex", icon)}
          >
            <Link to="/admin" aria-label="Admin dashboard">
              <LayoutDashboard className="size-5" />
            </Link>
          </Button>
        )}
        <Button variant="ghost" size="icon" asChild className={cn("size-10", icon)}>
          <Link to={user ? "/account" : "/auth"} aria-label={user ? "My account" : "Sign in"}>
            <UserRound className="size-5" />
          </Link>
        </Button>
        {overlay ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`Open bag with ${count} items`}
            className="relative grid size-10 place-items-center rounded-full hover:bg-white/15"
          >
            <ShoppingBag className="size-5" />
            <span className="absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-primary-foreground px-1 text-[10px] font-bold leading-4 text-brand">
              {count}
            </span>
          </button>
        ) : (
          <Button
            size="small"
            onClick={() => setOpen(true)}
            aria-label={`Open bag with ${count} items`}
            className="whitespace-nowrap px-3 sm:px-4"
          >
            <ShoppingBag className="size-4" />
            <span className="sm:hidden">{count}</span>
            <span className="hidden sm:inline">Bag ({count})</span>
          </Button>
        )}
        <Button
          variant={overlay ? "ghost" : "glass"}
          size="icon"
          className={cn("lg:hidden", overlay && cn("size-10", icon))}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-glass-border bg-glass px-4 py-2.5 shadow-glass backdrop-blur-xl sm:px-5">
        <div className="flex items-center gap-8">
          <Link to="/" aria-label="Sussflow home" className="shrink-0">
            <Logo className="h-7 sm:h-8" />
          </Link>
          <nav
            className="hidden items-center gap-6 text-sm font-medium text-foreground/70 lg:flex"
            aria-label="Main navigation"
          >
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="transition-colors hover:text-brand"
                activeProps={{ className: "text-brand" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        {headerIcons(false)}
      </div>
      {menuOpen && <MobileNav onClose={() => setMenuOpen(false)} isAdmin={isAdmin} />}
      <div className="mx-auto mt-3 max-w-7xl overflow-hidden rounded-full border border-glass-border bg-glass-soft py-2 backdrop-blur-xl">
        <div className="marquee-track flex w-max whitespace-nowrap text-xs font-semibold uppercase text-foreground/65">
          {[0, 1].map((item) => (
            <span key={item} className="px-8">
              {MARQUEE}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

function MobileNav({ onClose, isAdmin }: { onClose: () => void; isAdmin: boolean }) {
  return (
    <nav
      className="relative mx-auto mt-2 grid max-w-7xl gap-1 rounded-2xl border border-glass-border bg-background/95 p-3 text-foreground shadow-glass backdrop-blur-xl lg:hidden"
      aria-label="Mobile navigation"
    >
      {[
        ...NAV,
        { to: "/about", label: "About" },
        { to: "/store-location", label: "Store & delivery" },
      ].map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onClose}
          className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-glass"
        >
          {item.label}
        </Link>
      ))}
      {isAdmin && (
        <Link
          to="/admin"
          onClick={onClose}
          className="rounded-xl px-4 py-3 text-sm font-semibold text-brand hover:bg-glass"
        >
          Admin dashboard
        </Link>
      )}
    </nav>
  );
}
