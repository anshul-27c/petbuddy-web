import { Compass } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container width="narrow" className="py-16">
      <PageTitle title="Page not found" />
      <div className="flex flex-col items-center rounded-card border border-hairline bg-surface px-6 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-sky text-leash">
          <Compass className="size-6" aria-hidden />
        </div>
        <h1 className="mt-4 font-display text-headline font-semibold">We could not find that page</h1>
        <p className="mt-2 max-w-sm text-ink-muted">
          The link may be old, or the page has moved. Start again from the home page.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <ButtonLink href="/">Go to the home page</ButtonLink>
          <ButtonLink href="/carers" variant="outline">
            Find a carer
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
