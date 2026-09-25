"use client";

import { Siren } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatAgo } from "@/lib/format";
import type { Booking } from "@/lib/types";
import { LiveMap } from "./live-map";
import { SosDialog } from "./sos-dialog";

/** Shown while the carer is on the way or the visit is under way. The page refreshes every 5 s. */
export function LivePanel({ booking, updatedAt }: { booking: Booking; updatedAt: number }) {
  const [sosOpen, setSosOpen] = useState(false);
  return (
    <section
      aria-labelledby="live-title"
      className="border-beam rounded-card border border-leash-tint bg-surface p-4 shadow-card sm:p-5"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 id="live-title" className="flex items-center gap-2 text-title font-semibold">
            <span className="pulse-dot size-2.5 rounded-full bg-trail text-trail" aria-hidden />
            Live
          </h2>
          <p className="mt-1 text-small text-ink-muted">
            Updates every few seconds. Last checked {formatAgo(new Date(updatedAt).toISOString())}.
          </p>
        </div>
        <Button variant="danger" onClick={() => setSosOpen(true)} icon={<Siren className="size-4" aria-hidden />}>
          SOS
        </Button>
      </div>
      <LiveMap booking={booking} />
      <SosDialog booking={booking} open={sosOpen} onClose={() => setSosOpen(false)} />
    </section>
  );
}
