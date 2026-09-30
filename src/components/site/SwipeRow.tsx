import { Children, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * On phones: a sideways-swipe row with snap points, where the next card peeks in
 * so it's obvious there's more. From `sm` up it becomes a normal grid (`gridClass`).
 */
export function SwipeRow({
  children,
  gridClass = "sm:grid-cols-2 lg:grid-cols-3",
  itemClass = "w-[80%]",
  label,
}: {
  children: ReactNode;
  gridClass?: string;
  itemClass?: string;
  label?: string;
}) {
  return (
    <div
      role="list"
      aria-label={label}
      className={cn(
        "scrollbar-none -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto overscroll-x-contain px-5 pb-3",
        "sm:mx-0 sm:grid sm:snap-none sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0",
        gridClass,
      )}
    >
      {Children.map(children, (child) => (
        <div
          role="listitem"
          className={cn("flex shrink-0 snap-start sm:w-auto [&>*]:w-full", itemClass)}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
