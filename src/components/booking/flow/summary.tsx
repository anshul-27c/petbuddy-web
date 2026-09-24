"use client";

import { CalendarClock, MapPin, PawPrint, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Money } from "@/components/ui/money";
import { RatingInline } from "@/components/ui/stars";
import { formatSlot } from "@/lib/format";
import type { Address, Earner, Pet } from "@/lib/types";

function Line({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-ink-muted [&_svg]:size-4" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-small text-ink-muted">{label}</dt>
        <dd className="text-sm font-medium">{value ?? <span className="text-ink-faint">Not chosen yet</span>}</dd>
      </div>
    </div>
  );
}

/** What has been chosen so far, beside the steps on larger screens. */
export function BookingSummary({
  earner,
  serviceLabel,
  pet,
  start,
  minutes,
  address,
  totalPaise,
}: {
  earner: Earner;
  serviceLabel: string | null;
  pet: Pet | null;
  start: string | null;
  minutes: number;
  address: Address | null;
  totalPaise: number | null;
}) {
  const end = start ? new Date(new Date(start).getTime() + minutes * 60_000).toISOString() : null;
  return (
    <Card>
      <div className="flex items-center gap-3">
        <Avatar name={earner.name} verified={earner.idVerified} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{earner.name}</p>
          <RatingInline rating={earner.rating} count={earner.reviewCount} />
        </div>
      </div>
      <dl className="mt-4 space-y-3 border-t border-hairline pt-4">
        <Line icon={<Sparkles />} label="Service" value={serviceLabel} />
        <Line icon={<PawPrint />} label="Pet" value={pet?.name ?? null} />
        <Line icon={<CalendarClock />} label="When" value={start && end ? formatSlot(start, end) : null} />
        <Line
          icon={<MapPin />}
          label="Where"
          value={address ? `${address.label}, ${address.area}` : null}
        />
      </dl>
      {totalPaise !== null ? (
        <div className="mt-4 flex items-baseline justify-between border-t border-hairline pt-4">
          <span className="font-semibold">Total</span>
          <Money paise={totalPaise} display className="text-subhead" />
        </div>
      ) : null}
    </Card>
  );
}
