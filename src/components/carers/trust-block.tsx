import { BriefcaseBusiness, CalendarHeart, CircleCheck, CircleMinus, Info, Repeat } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { formatCount } from "@/lib/format";
import { isNewCarer, repeatPercent } from "@/lib/labels";
import type { Earner } from "@/lib/types";

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-leash [&_svg]:size-5" aria-hidden>
        {icon}
      </span>
      <span className="mt-1 font-display text-subhead font-semibold tabular-nums">{value}</span>
      <span className="text-small text-ink-muted">{label}</span>
    </div>
  );
}

function Check({ done, label, detail }: { done: boolean; label: string; detail: string }) {
  // `label` and `detail` already describe the done or not-done state.
  return (
    <li className="flex items-start gap-2.5">
      {done ? (
        <CircleCheck className="mt-0.5 size-5 shrink-0 text-trail" aria-hidden />
      ) : (
        <CircleMinus className="mt-0.5 size-5 shrink-0 text-ink-faint" aria-hidden />
      )}
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-small text-ink-muted">{detail}</p>
      </div>
    </li>
  );
}

/** Why this carer can be trusted, in facts rather than a badge level. */
export function TrustBlock({ earner }: { earner: Earner }) {
  return (
    <Card>
      <div className="grid grid-cols-3 gap-2">
        <Stat icon={<BriefcaseBusiness />} value={formatCount(earner.jobsDone)} label="jobs finished" />
        <Stat icon={<Repeat />} value={`${repeatPercent(earner)}%`} label="book again" />
        <Stat icon={<CalendarHeart />} value={String(new Date(earner.joinedAt).getFullYear())} label="joined" />
      </div>
      <ul className="mt-5 space-y-3 border-t border-hairline pt-4">
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
        <p className="mt-4 flex gap-2 rounded-field bg-amber-soft p-3 text-sm text-amber">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            <span className="font-semibold">New carer.</span> Fewer than 10 jobs so far.
            {earner.idVerified ? " Their ID has still been checked." : ""}
          </span>
        </p>
      ) : null}
    </Card>
  );
}
