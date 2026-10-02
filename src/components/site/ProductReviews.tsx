import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Star } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { submitReview } from "@/functions/reviews";
import { productReviewsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { readableError, reviewSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";

import { fieldClass, glassCard } from "./primitives";
import { Stars } from "./Stars";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

/** Approved reviews plus a form; new reviews appear after an admin approves them. */
export function ProductReviews({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const reviews = useQuery(productReviewsQuery(productId));
  const list = reviews.data ?? [];
  const average = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;

  return (
    <section id="reviews" className="mt-10 scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Ratings & reviews</h2>
          {list.length > 0 ? (
            <p className="mt-1 flex items-center gap-2 text-sm text-foreground/70">
              <Stars value={average} /> {average.toFixed(1)} out of 5 · {list.length}{" "}
              {list.length === 1 ? "review" : "reviews"}
            </p>
          ) : (
            <p className="mt-1 text-sm text-foreground/60">No reviews yet. Be the first!</p>
          )}
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_380px] [&>*]:min-w-0">
        <ul className="space-y-3">
          {list.map((review) => (
            <li key={review.id} className={`${glassCard} p-5`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Stars value={review.rating} />
                <time className="text-xs text-foreground/50" dateTime={review.created_at}>
                  {formatDate(review.created_at)}
                </time>
              </div>
              {review.comment && (
                <p className="mt-2 leading-relaxed text-foreground/80">{review.comment}</p>
              )}
              <p className="mt-2 text-sm font-semibold">{review.name}</p>
            </li>
          ))}
        </ul>
        <ReviewForm productId={productId} productName={productName} />
      </div>
    </section>
  );
}

function ReviewForm({ productId, productName }: { productId: string; productName: string }) {
  const send = useServerFn(submitReview);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = reviewSchema.safeParse({ productId, name, rating, comment, website });
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    setErrors({});
    setBusy(true);
    setFailure(null);
    try {
      await send({ data: result.data });
      setSent(true);
    } catch (error) {
      setFailure(readableError(error));
    } finally {
      setBusy(false);
    }
  };

  if (sent)
    return (
      <div className={`${glassCard} h-fit p-6 text-center`}>
        <Check className="mx-auto size-8 text-leaf" />
        <p className="mt-2 font-semibold">Thank you for your review!</p>
        <p className="mt-1 text-sm text-foreground/60">
          It will appear here once our team approves it.
        </p>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className={`${glassCard} h-fit space-y-4 p-6`}>
      <h3 className="font-display text-lg font-semibold">Rate {productName}</h3>
      <div>
        <div
          className="flex gap-1"
          role="radiogroup"
          aria-label="Your rating"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => {
                setRating(n);
                setErrors((e) => ({ ...e, rating: undefined }));
              }}
              className="p-0.5"
            >
              <Star
                className={cn(
                  "size-7 transition-colors",
                  n <= (hover || rating) ? "fill-[#f5a623] text-[#f5a623]" : "text-foreground/25",
                )}
              />
            </button>
          ))}
        </div>
        {errors["rating"] && (
          <p role="alert" className="mt-1 text-xs font-medium text-alert">
            {errors["rating"]}
          </p>
        )}
      </div>
      <label className="block text-xs font-semibold uppercase text-foreground/60">
        Your name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          autoComplete="given-name"
          className={cn(fieldClass, "mt-1")}
        />
        {errors["name"] && (
          <span role="alert" className="mt-1 block text-xs font-medium normal-case text-alert">
            {errors["name"]}
          </span>
        )}
      </label>
      <label className="block text-xs font-semibold uppercase text-foreground/60">
        Your review (optional)
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="What did you like? How did it work for your flow?"
          className={cn(fieldClass, "mt-1 normal-case")}
        />
      </label>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="review-website">Leave this empty</label>
        <input
          id="review-website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      {failure && (
        <p role="alert" className="text-sm font-medium text-alert">
          {failure}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy && <Loader2 className="size-4 animate-spin" />} Submit review
      </Button>
      <p className="text-xs text-foreground/50">
        Reviews are checked by our team before they appear.
      </p>
    </form>
  );
}
