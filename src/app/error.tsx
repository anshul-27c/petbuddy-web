"use client";

import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { ErrorState } from "@/components/ui/states";

export default function RouteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Container width="narrow" className="pt-10 sm:pt-16">
      <PageTitle title="Something went wrong" />
      <ErrorState error={error} onRetry={retry} />
    </Container>
  );
}
