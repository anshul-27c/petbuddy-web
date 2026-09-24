"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Minus, count, plus, in one pill. At one item the minus becomes remove. */
export function QuantityStepper({
  name,
  quantity,
  onChange,
  disabled = false,
  className,
}: {
  name: string;
  quantity: number;
  onChange: (quantity: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("inline-flex h-11 items-center rounded-full bg-sky text-leash-dark", className)}
      role="group"
      aria-label={`Quantity of ${name}`}
    >
      <button
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-full hover:bg-leash/15 disabled:opacity-50"
        onClick={() => onChange(quantity - 1)}
        disabled={disabled}
        aria-label={quantity <= 1 ? `Remove ${name}` : `Remove one ${name}`}
      >
        {quantity <= 1 ? <Trash2 className="size-4" aria-hidden /> : <Minus className="size-4" aria-hidden />}
      </button>
      <span className="min-w-6 text-center text-sm font-bold tabular-nums" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-full hover:bg-leash/15 disabled:opacity-50"
        onClick={() => onChange(quantity + 1)}
        disabled={disabled}
        aria-label={`Add one ${name}`}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
