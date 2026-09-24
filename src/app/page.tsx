"use client";

import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  MapPinned,
  PhoneOff,
  RotateCcw,
  Search,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { HeroVisual } from "@/components/home/hero-visual";
import { NearbyRail } from "@/components/home/nearby-rail";
import { NextBooking } from "@/components/home/next-booking";
import { ServicesGrid } from "@/components/home/services-grid";
import { StoreTeaser } from "@/components/home/store-teaser";
import { ButtonLink } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/card";
import { usePolicy } from "@/lib/queries";
import { PageTitle } from "@/components/layout/page-title";

function Step({ n, icon, title, body }: { n: number; icon: ReactNode; title: string; body: string }) {
  return (
    <li className="rounded-card border border-hairline bg-surface p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-sky text-sm font-bold text-leash-dark">
          {n}
        </span>
        <span className="text-leash [&_svg]:size-5" aria-hidden>
          {icon}
        </span>
      </div>
      <h3 className="mt-4 text-title font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-ink-muted">{body}</p>
    </li>
  );
}

function TrustItem({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <li className="flex gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-trail-soft text-trail [&_svg]:size-5" aria-hidden>
        {icon}
      </span>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-0.5 text-sm text-ink-muted">{body}</p>
      </div>
    </li>
  );
}

export default function HomePage() {
  const { freeCancelHours, cityName } = usePolicy();
  const hours = `${freeCancelHours} ${freeCancelHours === 1 ? "hour" : "hours"}`;

  return (
    <>
      <PageTitle title={"Pet care, close to home"} />
      <>
        <section className="border-b border-hairline bg-surface">
          <Container className="grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:py-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-sky px-3 py-1 text-small font-semibold text-leash-dark">
                <MapPinned className="size-4" aria-hidden />
                Now booking in {cityName}
              </p>
              <h1 className="mt-4 font-display text-[2.5rem] leading-[1.08] font-semibold tracking-tight sm:text-[3.25rem]">
                Pet care, close to home
              </h1>
              <p className="mt-4 max-w-xl text-title leading-relaxed text-ink-muted">
                Walks, sitting, grooming and vet runs from carers your neighbours already trust. Book in a minute and
                follow every visit live.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/carers" size="lg" icon={<Search className="size-5" aria-hidden />}>
                  Find a carer
                </ButtonLink>
                <ButtonLink href="#how-it-works" size="lg" variant="outline">
                  How it works
                </ButtonLink>
              </div>
              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
                <li className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-trail" aria-hidden />
                  ID-checked carers
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <MapPinned className="size-4 text-trail" aria-hidden />
                  Live tracking
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <RotateCcw className="size-4 text-trail" aria-hidden />
                  Free cancellation up to {hours} before
                </li>
              </ul>
            </div>
            <div className="pb-6 lg:pb-0">
              <HeroVisual />
            </div>
          </Container>
        </section>

        <Container>
          <NextBooking />

          <section aria-labelledby="services" className="mt-12 sm:mt-16">
            <SectionTitle id="services" title="What does your pet need?" subtitle="Prices start from the amount shown." />
            <ServicesGrid />
          </section>

          <section id="how-it-works" aria-labelledby="how-title" className="mt-14 sm:mt-20">
            <h2 id="how-title" className="font-display text-headline font-semibold sm:text-display">
              How it works
            </h2>
            <ol className="mt-5 grid gap-3 md:grid-cols-3">
              <Step
                n={1}
                icon={<Search />}
                title="Find a carer near you"
                body="Filter by service, price and rating, and see who is free today."
              />
              <Step
                n={2}
                icon={<CalendarCheck />}
                title="Pick a time and pay"
                body={`See the full price before you pay. Cancel free up to ${hours} before the visit.`}
              />
              <Step
                n={3}
                icon={<Smartphone />}
                title="Follow the visit live"
                body="Track your carer on the map, get photo updates and chat without sharing numbers."
              />
            </ol>
          </section>

          <section aria-labelledby="trust-title" className="mt-14 grid gap-8 rounded-card border border-hairline bg-surface p-6 sm:mt-20 sm:p-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <h2 id="trust-title" className="font-display text-headline font-semibold sm:text-display">
                Trust and safety, built in
              </h2>
              <p className="mt-3 text-ink-muted">
                Every carer is checked before their first booking, and every visit is visible to you from start to
                finish.
              </p>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2">
              <TrustItem
                icon={<ShieldCheck />}
                title="ID and selfie verification"
                body="Aadhaar and PAN are checked against a selfie before a carer can take bookings."
              />
              <TrustItem
                icon={<BadgeCheck />}
                title="Police verification badge"
                body="Carers who have cleared a police check carry a badge on their profile."
              />
              <TrustItem
                icon={<MapPinned />}
                title="Live tracking"
                body="Follow your carer on the map and see photo updates while the visit runs."
              />
              <TrustItem
                icon={<PhoneOff />}
                title="Masked calling"
                body="You and your carer talk without either of you seeing the other's number."
              />
              <TrustItem
                icon={<RotateCcw />}
                title="Free cancellation"
                body={`Cancel up to ${hours} before the visit for a full refund.`}
              />
            </ul>
          </section>

          <section aria-labelledby="near-title" className="mt-14 sm:mt-20">
            <SectionTitle
              id="near-title"
              title="Carers near you"
              subtitle="Closest first, with the next time they are free."
              action={
                <ButtonLink href="/carers" variant="ghost" icon={<ArrowRight className="size-4" aria-hidden />}>
                  See all
                </ButtonLink>
              }
            />
            <NearbyRail />
          </section>

          <section aria-label="Pet store" className="mt-14 sm:mt-20">
            <StoreTeaser />
          </section>
        </Container>

        <section aria-labelledby="carer-band" className="mt-14 bg-ink sm:mt-20">
          <Container className="flex flex-col gap-6 py-12 sm:py-14 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 id="carer-band" className="font-display text-headline font-semibold text-surface sm:text-display">
                Love animals? Earn with PetBuddy
              </h2>
              <p className="mt-2 text-sky">
                Set your own rates and hours, take bookings near you and withdraw your earnings to UPI or your bank.
              </p>
            </div>
            <ButtonLink href="/become-a-carer" size="lg" className="shrink-0">
              Become a carer
            </ButtonLink>
          </Container>
        </section>
      </>
    </>
  );
}
