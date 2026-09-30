"use client";

import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { ErrorState } from "@/components/ui/states";

export default function RouteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Container width="narrow" grow className="pt-6 sm:pt-10">
      <PageTitle title="Something went wrong" />
      <ErrorState fill error={error} onRetry={retry} />
    </Container>
  );
}
