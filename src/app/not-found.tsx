import { Compass } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container width="narrow" className="pt-10 sm:pt-16">
      <PageTitle title="Page not found" />
      <div className="relative isolate flex flex-col items-center overflow-hidden rounded-panel border border-hairline bg-surface px-6 py-12 text-center shadow-card sm:py-16">
        <div aria-hidden className="bg-dot-grid absolute inset-0 -z-10" />
        <div className="flex size-14 items-center justify-center rounded-card bg-sky text-leash shadow-card ring-8 ring-sky/50">
          <Compass className="size-6" aria-hidden />
        </div>
        <h1 className="mt-6 font-display text-headline font-semibold">We could not find that page</h1>
        <p className="mt-2 max-w-sm text-ink-muted">
          The link may be old, or the page has moved. Start again from the home page.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" sheen>
            Go to the home page
          </ButtonLink>
          <ButtonLink href="/carers" variant="outline">
            Find a carer
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
