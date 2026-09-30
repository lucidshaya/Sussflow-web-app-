import { Loader2, Search, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { glassCard } from "@/components/site/primitives";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const adminCard = `${glassCard} p-5 md:p-6`;
export const adminInput =
  "w-full rounded-xl border border-glass-border bg-glass px-3 py-2 text-sm outline-none transition-colors placeholder:text-foreground/40 focus:border-brand disabled:opacity-60";
export const th = "px-3 py-2.5 text-left text-xs font-semibold uppercase text-foreground/55";
export const td = "px-3 py-3 align-middle";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-sm text-foreground/60">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="relative block w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(adminInput, "rounded-full pl-9")}
      />
    </label>
  );
}

export function LeafSwitch(props: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  return (
    <Switch
      {...props}
      className="data-[state=checked]:bg-leaf data-[state=unchecked]:bg-foreground/20"
    />
  );
}

export function ConfirmDelete({
  title,
  description,
  onConfirm,
  trigger,
}: {
  title: string;
  description: string;
  onConfirm: () => Promise<unknown> | void;
  trigger?: ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-foreground/50 hover:text-alert"
            aria-label={title}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[28px] border-glass-border bg-background/95 backdrop-blur-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-11 rounded-full">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="h-11 rounded-full bg-alert text-primary-foreground hover:bg-alert/90"
            disabled={busy}
            onClick={async (event) => {
              event.preventDefault();
              setBusy(true);
              try {
                await onConfirm();
                setOpen(false);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy && <Loader2 className="size-4 animate-spin" />} Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 p-6 text-sm text-foreground/60">
      <Loader2 className="size-4 animate-spin" /> {label}
    </div>
  );
}

export function ErrorNote({ error }: { error: Error | null }) {
  if (!error) return null;
  return (
    <p className="rounded-2xl border border-alert/30 bg-alert/10 p-4 text-sm text-alert">
      {error.message}
    </p>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "leaf" | "alert";
}) {
  const tones = {
    neutral: "border-foreground/15 bg-glass-soft text-foreground/70",
    brand: "border-brand/30 bg-brand/10 text-brand",
    leaf: "border-leaf/40 bg-leaf/15 text-[oklch(0.45_0.14_144)]",
    alert: "border-alert/30 bg-alert/10 text-alert",
  };
  return (
    <span
      className={cn(
        "inline-flex self-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export const adminInvalid = "border-alert/60 bg-alert/5 focus:border-alert";

/** Labelled admin field with an inline validation message. */
export function AdminField({
  label,
  error,
  hint,
  wide,
  className,
  children,
}: {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  wide?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("block", wide && "sm:col-span-2", className)}>
      <span className="mb-1 block text-xs font-semibold uppercase text-foreground/55">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="mt-1 block text-xs font-medium text-alert">
          {error}
        </span>
      ) : (
        hint && <span className="mt-1 block text-xs text-foreground/45">{hint}</span>
      )}
    </label>
  );
}
