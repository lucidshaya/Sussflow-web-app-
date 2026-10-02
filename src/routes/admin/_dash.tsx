import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  ExternalLink,
  FolderTree,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Package,
  Receipt,
  Settings,
  Tags,
  Users,
  X,
  Newspaper,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";

import mark from "@/assets/sussflow-mark.png";
import { Logo } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/_dash")({
  head: () => ({
    meta: [{ title: "Dashboard | Sussflow Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/price-list", label: "Price list", icon: Tags },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: Receipt },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/blog", label: "Blog", icon: Newspaper },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) void navigate({ to: "/admin/login" });
  }, [loading, user, isAdmin, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="page-atmosphere grid min-h-screen place-items-center">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }

  const nav = (
    <nav className="space-y-1" aria-label="Admin navigation">
      {NAV.map(({ to, label, icon: Icon, ...rest }) => (
        <Link
          key={to}
          to={to}
          onClick={() => setMenuOpen(false)}
          activeOptions={{ exact: "exact" in rest }}
          className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-glass hover:text-brand"
          activeProps={{ className: "!bg-primary !text-primary-foreground shadow-glass" }}
        >
          <Icon className="size-4" /> {label}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="space-y-1 border-t border-foreground/10 pt-4 text-sm">
      <Link
        to="/"
        className="flex items-center gap-3 rounded-2xl px-4 py-2.5 font-medium text-foreground/70 hover:bg-glass hover:text-brand"
      >
        <ExternalLink className="size-4" /> View store
      </Link>
      <button
        type="button"
        onClick={() => void signOut().then(() => navigate({ to: "/admin/login" }))}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 font-medium text-foreground/70 hover:bg-glass hover:text-alert"
      >
        <LogOut className="size-4" /> Sign out
      </button>
      <p className="truncate px-4 pt-2 text-xs text-foreground/50">{user.email}</p>
    </div>
  );

  return (
    <div className="page-atmosphere min-h-screen text-foreground">
      <div className="mx-auto flex max-w-[1500px] gap-5 p-4 sm:p-5">
        {/* Desktop sidebar */}
        <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] w-64 shrink-0 flex-col justify-between rounded-[28px] border border-glass-border bg-glass p-4 shadow-glass backdrop-blur-xl lg:flex">
          <div>
            <Link to="/admin" className="mb-6 block px-3 pt-2">
              <Logo className="h-8" />
              <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-brand">
                Admin
              </span>
            </Link>
            {nav}
          </div>
          {footer}
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile top bar */}
          <div className="mb-4 flex items-center justify-between rounded-full border border-glass-border bg-glass px-4 py-2 shadow-glass backdrop-blur-xl lg:hidden">
            <Link to="/admin" className="flex items-center gap-2">
              <img src={mark} alt="" className="h-7 w-auto" />
              <span className="text-sm font-semibold">Sussflow Admin</span>
            </Link>
            <Button
              variant="glass"
              size="icon"
              className="size-9"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
          {menuOpen && (
            <div
              className={cn(
                "mb-4 space-y-3 rounded-3xl border border-glass-border bg-glass p-3 shadow-glass backdrop-blur-xl lg:hidden",
              )}
            >
              {nav}
              {footer}
            </div>
          )}
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
