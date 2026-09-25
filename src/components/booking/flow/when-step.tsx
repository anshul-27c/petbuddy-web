"use client";

import { AvailabilityPicker } from "@/components/carers/availability-picker";
import { ErrorNotice } from "@/components/ui/notice";
import { formatDuration } from "@/lib/format";
import type { ServiceKey, Slot } from "@/lib/types";

export function WhenStep({
  earnerId,
  carerName,
  service,
  serviceLabel,
  minutes,
  value,
  onChange,
  conflict,
}: {
  earnerId: string;
  carerName: string;
  service: ServiceKey;
  serviceLabel: string;
  minutes: number;
  value: string | null;
  onChange: (slot: Slot) => void;
  conflict: unknown;
}) {
  return (
    <div>
      <h2 className="font-display text-subhead font-semibold sm:text-headline">When should {carerName} come?</h2>
      <p className="mt-2 text-body text-ink-muted">
        {serviceLabel} takes about {formatDuration(minutes)}. Times that are taken, or too short for it, are crossed out.
      </p>
      {conflict ? <ErrorNotice error={conflict} className="mt-4" /> : null}
      <div className="mt-4 rounded-card border border-hairline bg-surface p-4 shadow-card sm:mt-5 sm:p-5">
        <AvailabilityPicker
          earnerId={earnerId}
          service={service}
          carerName={carerName}
          selected={value}
          onSelect={onChange}
        />
      </div>
    </div>
  );
}
