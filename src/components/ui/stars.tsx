"use client";

import { Star } from "lucide-react";
import { useId } from "react";
import { formatCount, formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";

/** "★ 4.8 (126)", or "New" when there are no reviews yet. */
export function RatingInline({
  rating,
  count,
  className,
}: {
  rating: number;
  count: number;
  className?: string;
}) {
  if (!count) {
    return <span className={cn("text-small font-semibold text-leash-dark", className)}>New</span>;
  }
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <Star className="size-4 fill-amber text-amber" aria-hidden />
      <span className="font-semibold tabular-nums text-ink">{formatRating(rating)}</span>
      <span className="text-ink-muted tabular-nums">
        ({formatCount(count)}
        <span className="sr-only"> reviews</span>)
      </span>
    </span>
  );
}

/** Five stars filled to the rating, for reviews. */
export function StarRow({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn("size-4", star <= Math.round(value) ? "fill-amber text-amber" : "text-hairline")}
          aria-hidden
        />
      ))}
    </span>
  );
}

/** A 1–5 star picker built on radio inputs, so arrow keys work. */
export function StarInput({
  value,
  onChange,
  label = "Your rating",
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}) {
  const name = useId();
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className="flex items-center justify-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <label key={star} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              className="peer sr-only"
            />
            <span className="inline-flex size-12 items-center justify-center rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-leash">
              <Star
                className={cn("size-8 transition-colors", star <= value ? "fill-amber text-amber" : "text-ink-faint")}
                aria-hidden
              />
            </span>
            <span className="sr-only">{star} of 5</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
