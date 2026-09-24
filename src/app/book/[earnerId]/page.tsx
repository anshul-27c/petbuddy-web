"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { BookingFlow } from "@/components/booking/flow/booking-flow";
import { Container, PageHeader } from "@/components/layout/container";
import { PageSkeleton } from "@/components/ui/skeleton";
import { SERVICE_KEYS } from "@/lib/labels";
import type { ServiceKey } from "@/lib/types";
import { PageTitle } from "@/components/layout/page-title";

function validStart(value: string | null): string | null {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) && time > Date.now() ? value : null;
}

function Book({ earnerId }: { earnerId: string }) {
  const params = useSearchParams();
  const service = params.get("service");
  return (
    <Container>
      <PageHeader title="Book a visit" subtitle="Four quick steps. You see the full price before you pay." />
      <BookingFlow
        earnerId={earnerId}
        initialService={SERVICE_KEYS.includes(service as ServiceKey) ? (service as ServiceKey) : null}
        initialStart={validStart(params.get("start"))}
      />
    </Container>
  );
}

export default function BookPage() {
  const { earnerId } = useParams<{ earnerId: string }>();
  return (
    <>
      <PageTitle title={"Book a visit"} />
      <RequireAuth>
        <Suspense fallback={<PageSkeleton />}>
          <Book earnerId={earnerId} />
        </Suspense>
      </RequireAuth>
    </>
  );
}
