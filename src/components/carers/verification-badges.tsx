import { BadgeCheck, ShieldCheck } from "lucide-react";
import { Tag } from "@/components/ui/chip";

export function VerificationBadges({
  idVerified,
  policeVerified,
}: {
  idVerified: boolean;
  policeVerified: boolean;
}) {
  if (!idVerified && !policeVerified) return null;
  return (
    <>
      {idVerified ? (
        <Tag tone="trail" icon={<ShieldCheck className="size-3.5" aria-hidden />}>
          ID verified
        </Tag>
      ) : null}
      {policeVerified ? (
        <Tag tone="trail" icon={<BadgeCheck className="size-3.5" aria-hidden />}>
          Police verified
        </Tag>
      ) : null}
    </>
  );
}
