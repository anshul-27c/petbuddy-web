"use client";

import { useId } from "react";
import { ChoiceCard } from "@/components/ui/field";
import { ServiceIcon } from "@/components/ui/icons";
import { Money } from "@/components/ui/money";
import { formatDuration } from "@/lib/format";
import { useServiceCatalogue } from "@/lib/queries";
import type { Earner, ServiceKey } from "@/lib/types";

export function ServiceStep({
  earner,
  value,
  onChange,
}: {
  earner: Earner;
  value: ServiceKey | null;
  onChange: (service: ServiceKey) => void;
}) {
  const name = useId();
  const catalogue = useServiceCatalogue();
  return (
    <fieldset>
      <legend className="text-subhead font-bold">What do you need?</legend>
      <p className="mt-1 text-sm text-ink-muted">Prices are for one booking at the usual length.</p>
      <div className="mt-4 grid gap-2">
        {earner.services.map((key) => {
          const service = catalogue.get(key);
          const price = earner.prices[key];
          return (
            <ChoiceCard
              key={key}
              name={name}
              value={key}
              checked={value === key}
              onChange={(next) => onChange(next as ServiceKey)}
              icon={<ServiceIcon service={key} />}
              title={service.label}
              description={`${service.blurb} · ${formatDuration(service.defaultMinutes)}`}
              trailing={
                price !== undefined ? (
                  <Money paise={price} display className="text-title" />
                ) : (
                  <Money paise={earner.pricePerHourPaise} display suffix="/hr" className="text-title" />
                )
              }
            />
          );
        })}
      </div>
    </fieldset>
  );
}
