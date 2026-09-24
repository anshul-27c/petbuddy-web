"use client";

import { useId } from "react";
import { ChoiceCard } from "@/components/ui/field";
import { METHOD_ICONS } from "@/components/ui/icons";
import { PAYMENT_METHODS } from "@/lib/labels";
import type { PaymentMethod } from "@/lib/types";

/** UPI first (how most of India pays), then card and netbanking. */
export function PaymentMethodPicker({
  value,
  onChange,
  disabled,
  compact = false,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const name = useId();
  return (
    <fieldset disabled={disabled}>
      <legend className="text-sm font-semibold">Pay with</legend>
      <div className={compact ? "mt-2 grid gap-2 sm:grid-cols-3" : "mt-2 grid gap-2"}>
        {PAYMENT_METHODS.map((method) => {
          const Icon = METHOD_ICONS[method.value];
          return (
            <ChoiceCard
              key={method.value}
              name={name}
              value={method.value}
              checked={value === method.value}
              onChange={(next) => onChange(next as PaymentMethod)}
              title={method.label}
              description={compact ? undefined : method.blurb}
              icon={<Icon aria-hidden />}
              disabled={disabled}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
