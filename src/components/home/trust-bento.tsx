"use client";

import { BadgeCheck, Check, MapPinned, PhoneOff, RotateCcw, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { IconTile } from "@/components/ui/icon-tile";
import { Reveal, revealItem } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

/** A sketch of a checked ID beside a selfie. Decorative. */
function IdSketch() {
  return (
    <div aria-hidden className="relative hidden w-56 shrink-0 self-center sm:block">
      <div className="rounded-card border border-hairline bg-surface p-4 shadow-lift">
        <div className="flex items-center gap-3">
          <span className="size-12 rounded-field bg-linear-to-br from-sky to-leash-tint" />
          <div className="flex-1 space-y-2">
            <span className="block h-2 w-3/4 rounded-full bg-hairline" />
            <span className="block h-2 w-1/2 rounded-full bg-hairline" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <span className="block h-2 w-full rounded-full bg-canvas" />
          <span className="block h-2 w-5/6 rounded-full bg-canvas" />
        </div>
      </div>
      <span className="absolute -top-3 -right-3 flex size-10 items-center justify-center rounded-full bg-trail text-surface shadow-float ring-4 ring-surface">
        <Check className="size-5" strokeWidth={3} />
      </span>
    </div>
  );
}

function Tile({
  icon,
  title,
  body,
  feature = false,
  className,
  index,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  feature?: boolean;
  className?: string;
  index: number;
}) {
  if (!feature) {
    return (
      <li
        className={cn(
          "flex gap-4 rounded-card border border-hairline bg-surface p-4 shadow-card sm:flex-col sm:p-5",
          className,
        )}
        {...revealItem(index)}
      >
        <IconTile tone="trail" size="lg">
          {icon}
        </IconTile>
        <div className="min-w-0">
          <h3 className="text-title font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-ink-muted">{body}</p>
        </div>
      </li>
    );
  }
  return (
    <li
      className={cn(
        "flex gap-6 rounded-card border border-hairline bg-linear-to-br from-surface to-trail-soft/60 p-4 shadow-card sm:p-5",
        className,
      )}
      {...revealItem(index)}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <IconTile tone="trail" size="xl">
          {icon}
        </IconTile>
        <div className="min-w-0">
          <h3 className="text-subhead font-semibold">{title}</h3>
          <p className="mt-1 max-w-sm text-body text-ink-muted">{body}</p>
        </div>
      </div>
      <IdSketch />
    </li>
  );
}

/**
 * Five safety features as a bento: the ID check is the feature tile, and the
 * spans are chosen so every row is full (2 + 1 / 1 + 1 + 1 at three columns,
 * 2 / 1 + 1 / 1 + 1 at two, one per row on phones).
 */
export function TrustBento({ hours }: { hours: string }) {
  return (
    <Reveal as="ul" className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      <Tile
        index={0}
        feature
        className="sm:col-span-2"
        icon={<ShieldCheck />}
        title="ID and selfie verification"
        body="Aadhaar and PAN are checked against a selfie before a carer can take bookings."
      />
      <Tile
        index={1}
        icon={<BadgeCheck />}
        title="Police verification badge"
        body="Carers who have cleared a police check carry a badge on their profile."
      />
      <Tile
        index={2}
        icon={<MapPinned />}
        title="Live tracking"
        body="Follow your carer on the map and see photo updates while the visit runs."
      />
      <Tile
        index={3}
        icon={<PhoneOff />}
        title="Masked calling"
        body="You and your carer talk without either of you seeing the other's number."
      />
      <Tile
        index={4}
        icon={<RotateCcw />}
        title="Free cancellation"
        body={`Cancel up to ${hours} before the visit for a full refund.`}
      />
    </Reveal>
  );
}
