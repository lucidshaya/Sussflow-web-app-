import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Swipeable product photos: scroll-snap on touch, arrows on larger screens,
 * and a thumbnail strip that scrolls sideways when there are many photos.
 */
export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const many = images.length > 1;

  const goTo = (index: number) => {
    const el = track.current;
    if (!el) return;
    const i = Math.max(0, Math.min(images.length - 1, index));
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-[28px] border border-glass-border bg-glass-soft shadow-glass">
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          aria-label={`${alt} photos`}
        >
          {images.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={i === 0 ? alt : `${alt}, photo ${i + 1}`}
              width={816}
              height={816}
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
              className="aspect-square w-full shrink-0 snap-center snap-always object-cover"
            />
          ))}
        </div>

        {many && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-primary-foreground/85 text-foreground shadow-glass backdrop-blur transition hover:text-brand disabled:opacity-0 sm:grid"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={active === images.length - 1}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-primary-foreground/85 text-foreground shadow-glass backdrop-blur transition hover:text-brand disabled:opacity-0 sm:grid"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {images.map((src, i) => (
                <span
                  key={src}
                  className={cn(
                    "h-1.5 rounded-full bg-primary-foreground shadow transition-all",
                    i === active ? "w-5" : "w-1.5 opacity-60",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {many && (
        <div className="scrollbar-none -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show photo ${i + 1}`}
              className={cn(
                "size-16 shrink-0 overflow-hidden rounded-2xl border-2 transition sm:size-20",
                i === active ? "border-brand" : "border-glass-border opacity-75 hover:opacity-100",
              )}
            >
              <img src={src} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
