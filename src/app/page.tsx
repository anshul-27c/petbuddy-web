"use client";

import { MapPinned, RotateCcw, Search, ShieldCheck, Truck } from "lucide-react";
import { CarerBand } from "@/components/home/carer-band";
import { HeroVisual } from "@/components/home/hero-visual";
import { HowItWorks } from "@/components/home/how-it-works";
import { NearbyRail } from "@/components/home/nearby-rail";
import { NextBooking } from "@/components/home/next-booking";
import { ServicesGrid } from "@/components/home/services-grid";
import { StoreTeaser } from "@/components/home/store-teaser";
import { TrustBento } from "@/components/home/trust-bento";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, revealItem } from "@/components/ui/motion";
import { SectionHeader, SectionLink } from "@/components/ui/section-header";
import { ShaderBackdrop } from "@/components/ui/shader-backdrop";
import { usePolicy } from "@/lib/queries";

export default function HomePage() {
  const { freeCancelHours, cityName } = usePolicy();
  const hours = `${freeCancelHours} ${freeCancelHours === 1 ? "hour" : "hours"}`;

  return (
    <>
      <PageTitle title={"Pet care, close to home"} />

      <section aria-labelledby="hero-title" className="relative isolate overflow-hidden border-b border-hairline">
        <ShaderBackdrop />
        {/* A soft scrim under the copy keeps body text at 4.5:1 wherever the aurora drifts. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-surface/70 via-surface/40 to-transparent lg:bg-linear-to-r lg:from-surface/75 lg:via-surface/35"
        />
        <Container className="relative grid items-center gap-12 pt-10 pb-12 sm:pt-16 sm:pb-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pt-20 lg:pb-24">
          <Reveal>
            <p
              {...revealItem(0)}
              className="shine inline-flex items-center gap-2 rounded-full border border-leash/15 bg-sky px-3 py-1 text-small font-semibold text-leash-dark"
            >
              <MapPinned className="size-4" aria-hidden />
              Now booking in {cityName}
            </p>
            <h1 id="hero-title" {...revealItem(1)} className="mt-4 font-display text-hero font-semibold sm:text-mega">
              Pet care, <span className="text-gradient">close to home</span>
            </h1>
            <p {...revealItem(2)} className="mt-4 max-w-xl text-title leading-relaxed text-ink/80">
              Walks, sitting, grooming and vet runs from carers your neighbours already trust. Book in a minute and
              follow every visit live.
            </p>
            <div {...revealItem(3)} className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/carers" size="lg" sheen icon={<Search className="size-5" aria-hidden />}>
                Find a carer
              </ButtonLink>
              <ButtonLink href="#how-it-works" size="lg" variant="outline">
                How it works
              </ButtonLink>
            </div>
            <ul {...revealItem(4)} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/80">
              <li className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-trail" aria-hidden />
                ID-checked carers
              </li>
              <li className="inline-flex items-center gap-2">
                <MapPinned className="size-4 text-trail" aria-hidden />
                Live tracking
              </li>
              <li className="inline-flex items-center gap-2">
                <RotateCcw className="size-4 text-trail" aria-hidden />
                Free cancellation up to {hours} before
              </li>
            </ul>
          </Reveal>
          <Reveal self className="hidden pb-6 sm:block lg:pb-0">
            <HeroVisual />
          </Reveal>
        </Container>
      </section>

      <Container className="stack-landing mt-16 sm:mt-24">
        <NextBooking />

        <section aria-labelledby="services">
          <SectionHeader
            id="services"
            eyebrow="Services"
            title="What does your pet need?"
            subtitle="Prices start from the amount shown."
          />
          <ServicesGrid />
        </section>

        <section id="how-it-works" aria-labelledby="how-title">
          <SectionHeader
            id="how-title"
            eyebrow="Three steps"
            title="How it works"
          />
          <HowItWorks hours={hours} />
        </section>

        <section aria-labelledby="trust-title">
          <SectionHeader
            id="trust-title"
            eyebrow="Safety"
            title="Trust and safety, built in"
            subtitle="Every carer is checked before their first booking, and every visit is visible to you from start to finish."
          />
          <TrustBento hours={hours} />
        </section>

        <section aria-labelledby="near-title">
          <SectionHeader
            id="near-title"
            eyebrow="Carers"
            title="Carers near you"
            subtitle="Closest first, with the next time they are free."
            action={<SectionLink href="/carers">See all</SectionLink>}
          />
          <NearbyRail />
        </section>

        <section aria-labelledby="store-title">
          <SectionHeader
            id="store-title"
            eyebrow={
              <>
                <Truck className="size-4" aria-hidden />
                Delivered to your door
              </>
            }
            title="The PetBuddy store"
            subtitle="Food and treats, toys, grooming kits and everyday gear, picked for pets like yours."
            action={<SectionLink href="/store">Visit the store</SectionLink>}
          />
          <StoreTeaser />
        </section>

        <CarerBand />
      </Container>
    </>
  );
}
