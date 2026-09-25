"use client";

import { BriefcaseBusiness, CalendarHeart, CircleCheck, CircleMinus, Info, Repeat } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { CountUp } from "@/components/ui/motion";
import { formatCount } from "@/lib/format";
import { isNewCarer, repeatPercent } from "@/lib/labels";
import type { Earner } from "@/lib/types";

function Stat({ icon, value, label }: { icon: ReactNode; value: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-field bg-mist px-2 py-4 text-center">
      <IconTile size="sm">{icon}</IconTile>
      <span className="mt-2 font-display text-subhead font-semibold sm:text-headline">{value}</span>
      <span className="text-small text-ink-muted">{label}</span>
    </div>
  );
}

function Check({ done, label, detail }: { done: boolean; label: string; detail: string }) {
  // `label` and `detail` already describe the done or not-done state.
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-5 shrink-0 items-center" aria-hidden>
        {done ? (
          <CircleCheck className="size-5 text-trail" />
        ) : (
          <CircleMinus className="size-5 text-ink-faint" />
        )}
      </span>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-small text-ink-muted">{detail}</p>
      </div>
    </li>
  );
}

/** Why this carer can be trusted, in facts rather than a badge level. The figures count up as they appear. */
export function TrustBlock({ earner }: { earner: Earner }) {
  const repeat = repeatPercent(earner);
  return (
    <Card>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat
          icon={<BriefcaseBusiness />}
          value={<CountUp value={earner.jobsDone} format={(n) => formatCount(Math.round(n))} />}
          label="jobs finished"
        />
        <Stat
          icon={<Repeat />}
          value={<CountUp value={repeat} format={(n) => `${Math.round(n)}%`} />}
          label="book again"
        />
        <Stat
          icon={<CalendarHeart />}
          value={<span className="tabular-nums">{new Date(earner.joinedAt).getFullYear()}</span>}
          label="joined"
        />
      </div>
      <ul className="mt-5 grid gap-4 border-t border-hairline pt-5 sm:grid-cols-2">
        <Check
          done={earner.idVerified}
          label={earner.idVerified ? "ID verified" : "ID not verified yet"}
          detail={
            earner.idVerified
              ? "Aadhaar and PAN checked against a selfie."
              : "Their ID check is not complete."
          }
        />
        <Check
          done={earner.policeVerified}
          label={earner.policeVerified ? "Police verified" : "No police verification yet"}
          detail={
            earner.policeVerified
              ? "Cleared a police verification check."
              : "Police verification is optional and shown here once it is done."
          }
        />
      </ul>
      {isNewCarer(earner) ? (
        <p className="mt-5 flex gap-2 rounded-field bg-amber-soft p-3 text-sm text-amber">
          <span className="flex h-5 shrink-0 items-center" aria-hidden>
            <Info className="size-4" />
          </span>
          <span>
            <span className="font-semibold">New carer.</span> Fewer than 10 jobs so far.
            {earner.idVerified ? " Their ID has still been checked." : ""}
          </span>
        </p>
      ) : null}
    </Card>
  );
}
