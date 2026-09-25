"use client";

import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/motion";
import { SectionHeader } from "@/components/ui/section-header";
import { ShaderBackdrop } from "@/components/ui/shader-backdrop";

/** The carer sign-up band: a dark panel over the night aurora. */
export function CarerBand() {
  return (
    <Reveal
      as="section"
      self
      aria-labelledby="carer-band"
      className="relative isolate overflow-hidden rounded-panel bg-ink-deep shadow-float"
    >
      <ShaderBackdrop tone="night" />
      <div className="relative grid gap-6 p-6 sm:p-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-10 lg:p-12">
        <SectionHeader
          id="carer-band"
          inverse
          flush
          eyebrow="For carers"
          title="Love animals? Earn with PetBuddy"
          subtitle="Set your own rates and hours, take bookings near you and withdraw your earnings to UPI or your bank."
        />
        <ButtonLink href="/become-a-carer" size="lg" variant="light" className="group w-full md:w-auto">
          Become a carer
          <ArrowRight className="size-5 transition-transform duration-150 group-hover:translate-x-1" aria-hidden />
        </ButtonLink>
      </div>
    </Reveal>
  );
}
