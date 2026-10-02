import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/** Read-only star rating, e.g. 4.5 → four full stars and a half. */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - (n - 1)));
        return (
          <span key={n} className="relative inline-block size-4">
            <Star className="absolute inset-0 size-4 text-foreground/20" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="size-4 fill-[#f5a623] text-[#f5a623]" />
            </span>
          </span>
        );
      })}
    </span>
  );
}
