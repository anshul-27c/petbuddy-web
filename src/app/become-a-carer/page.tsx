"use client";

import {
  BadgeCheck,
  CalendarClock,
  Camera,
  HandCoins,
  IdCard,
  Landmark,
  MessageCircleQuestion,
  Package,
  PhoneOff,
  Plus,
  Siren,
  Smartphone,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { LogoMark } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { Reveal, revealItem } from "@/components/ui/motion";
import { SectionHeader } from "@/components/ui/section-header";
import { ShaderBackdrop } from "@/components/ui/shader-backdrop";
import { formatMoney } from "@/lib/format";
import { useConfig } from "@/lib/queries";
import { PageTitle } from "@/components/layout/page-title";

function JoinStep({
  n,
  icon,
  title,
  children,
  last = false,
}: {
  n: number;
  icon: ReactNode;
  title: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-4 pb-8 last:pb-0" {...revealItem(n - 1)}>
      {!last ? (
        <span aria-hidden className="absolute top-12 bottom-0 left-6 w-px -translate-x-1/2 overflow-hidden bg-hairline">
          <span
            className="block h-1/2 w-full bg-linear-to-b from-transparent via-leash to-transparent motion-safe:animate-[beam-travel-y_2.8s_ease-in-out_infinite]"
            style={{ animationDelay: `${(n - 1) * 0.5}s` }}
          />
        </span>
      ) : null}
      <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface text-leash shadow-card ring-8 ring-canvas [&_svg]:size-5">
        {icon}
      </span>
      <div className="min-w-0 pt-1">
        <p className="eyebrow text-leash-dark">Step {n}</p>
        <h3 className="mt-1 text-title font-semibold">{title}</h3>
        <div className="mt-1 space-y-2 text-ink-muted">{children}</div>
      </div>
    </li>
  );
}

function Point({ icon, title, children, index }: { icon: ReactNode; title: string; children: ReactNode; index: number }) {
  return (
    <li className="flex" {...revealItem(index)}>
      <Card className="w-full">
        <IconTile tone="trail" size="lg">
          {icon}
        </IconTile>
        <h3 className="mt-4 text-title font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-ink-muted">{children}</p>
      </Card>
    </li>
  );
}

function Question({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details className="group rounded-card border border-hairline bg-surface shadow-card transition-colors duration-150 open:border-leash-tint">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 p-4 font-semibold sm:p-5 [&::-webkit-details-marker]:hidden">
        {q}
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky text-leash transition-transform duration-300 ease-out-soft group-open:rotate-45"
        >
          <Plus className="size-4" />
        </span>
      </summary>
      <div className="-mt-2 px-4 pb-4 text-ink-muted sm:px-5 sm:pb-5">{children}</div>
    </details>
  );
}

export default function BecomeACarerPage() {
  const { data: config } = useConfig();
  const commission = config ? `${config.commissionPercent}%` : null;
  const minWithdrawal = config ? formatMoney(config.minWithdrawalPaise) : null;
  const kitPrice = config ? formatMoney(config.starterKitPricePaise) : null;

  return (
    <>
      <PageTitle title={"Become a carer"} />

      <section aria-labelledby="become-title" className="relative isolate overflow-hidden border-b border-hairline">
        <ShaderBackdrop />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-surface/70 via-surface/40 to-transparent lg:bg-linear-to-r lg:from-surface/75 lg:via-surface/35"
        />
        <Container className="relative grid items-center gap-10 pt-10 pb-12 sm:pt-16 sm:pb-16 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:pt-20 lg:pb-24">
          <Reveal>
            <p
              {...revealItem(0)}
              className="shine inline-flex items-center gap-2 rounded-full border border-leash/15 bg-sky px-3 py-1 text-small font-semibold text-leash-dark"
            >
              <HandCoins className="size-4" aria-hidden />
              For carers
            </p>
            <h1 id="become-title" {...revealItem(1)} className="mt-4 font-display text-hero font-semibold sm:text-mega">
              Earn with <span className="text-gradient">PetBuddy</span>
            </h1>
            <p {...revealItem(2)} className="mt-4 max-w-xl text-title leading-relaxed text-ink/80">
              Look after pets near you, on your own hours. Set your own rates, take the bookings you want and get
              paid for every visit.
            </p>
            <div {...revealItem(3)} className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#how-to-join" size="lg" sheen>
                How to join
              </ButtonLink>
              <ButtonLink href="#getting-paid" size="lg" variant="outline">
                How you get paid
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal self>
            <div className="space-y-4 rounded-panel border border-surface/80 bg-surface/75 p-5 shadow-float backdrop-blur sm:p-6">
              <div className="flex items-center gap-4">
                <LogoMark size="lg" />
                <div className="min-w-0">
                  <p className="text-title font-semibold">Carers join in the PetBuddy app</p>
                  <p className="mt-1 text-sm text-ink-muted">This website is for booking care.</p>
                </div>
              </div>
              <p className="border-t border-hairline pt-4 text-sm text-ink-muted">
                Install the PetBuddy app on your phone, sign in with your mobile number and choose{" "}
                <span className="font-semibold text-ink">Earn with PetBuddy</span>. If you already book care with us,
                use the same number: one account does both.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <Container className="stack-landing mt-16 sm:mt-24">
        <section
          id="how-to-join"
          aria-labelledby="join-title"
          className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16"
        >
          <div>
            <div className="lg:sticky lg:top-24">
              <SectionHeader
                id="join-title"
                eyebrow="Joining"
                title="How to join"
                subtitle="Five steps, all in the app. Everything saves as you go, so you can stop and come back."
              />
            </div>
          </div>
          <Reveal as="ol">
            <JoinStep n={1} icon={<Smartphone />} title="Sign in and choose to earn">
              <p>Use your mobile number. The same account can book care for your own pets too.</p>
            </JoinStep>
            <JoinStep n={2} icon={<IdCard />} title="Get verified">
              <p>
                Enter your full name as on your Aadhaar and your date of birth, then upload your Aadhaar and PAN and
                take a selfie.
              </p>
              <p className="flex items-start gap-2 rounded-field bg-mist p-3 text-sm">
                <span className="flex h-5 shrink-0 items-center" aria-hidden>
                  <Camera className="size-4 text-leash" />
                </span>
                <span>
                  We check that your documents match your name and that your selfie matches your ID. It usually takes
                  one working day, and we let you know as soon as it is done.
                </span>
              </p>
            </JoinStep>
            <JoinStep n={3} icon={<CalendarClock />} title="Set up your work">
              <p>Pick the services you offer, your hourly rate, how far you will travel and the hours you are free each week.</p>
            </JoinStep>
            <JoinStep n={4} icon={<Landmark />} title="Add where to pay you">
              <p>A UPI ID or a bank account. Only the last four digits of an account number are ever shown back.</p>
            </JoinStep>
            <JoinStep n={5} last icon={<Package />} title="Order your starter kit (optional)">
              <p>
                A printed PetBuddy ID card and two wristbands, posted to you. Owners recognise the card at the door.
              </p>
              <p className="text-sm">
                {kitPrice ? `A one-time ${kitPrice}, ` : "A one-time charge, "}not a subscription, with a full refund
                within 7 days of delivery if you change your mind.
              </p>
            </JoinStep>
          </Reveal>
        </section>

        <section id="getting-paid" aria-labelledby="paid-title">
          <SectionHeader id="paid-title" eyebrow="Payouts" title="How you get paid" />
          <Reveal as="ul" className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-3">
            <Point index={0} icon={<HandCoins />} title="Your rate, your call">
              You set an hourly rate and each service is priced from it. Owners see the full price before they pay.
            </Point>
            <Point index={1} icon={<BadgeCheck />} title="Clear commission">
              {commission ? `PetBuddy keeps ${commission} of each job. ` : "PetBuddy keeps a set commission on each job. "}
              Tips from owners go to you in full.
            </Point>
            <Point index={2} icon={<Wallet />} title="Withdraw to UPI or bank">
              Earnings from a finished job become available after a short hold. Withdraw once you have
              {minWithdrawal ? ` ${minWithdrawal}` : " the minimum"} or more.
            </Point>
          </Reveal>
        </section>

        <section aria-labelledby="safety-title">
          <SectionHeader id="safety-title" eyebrow="Safety" title="Looked after on every job" />
          <Reveal as="ul" className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-3">
            <Point index={0} icon={<Wallet />} title="Paid before you go">
              Owners pay when they book, so every request you accept is already paid for.
            </Point>
            <Point index={1} icon={<PhoneOff />} title="Masked numbers">
              You and the owner chat and call without seeing each other&apos;s number.
            </Point>
            <Point index={2} icon={<Siren />} title="SOS on live visits">
              If something goes wrong during a visit, the operations team is one tap away.
            </Point>
          </Reveal>
        </section>

        <section aria-labelledby="faq-title">
          <SectionHeader
            id="faq-title"
            eyebrow={
              <>
                <MessageCircleQuestion className="size-4" aria-hidden />
                Questions
              </>
            }
            title="Questions carers ask"
          />
          <div className="grid grid-cols-1 items-start gap-3 sm:gap-4 lg:grid-cols-2">
            <Question q="Can I book care and earn with the same account?">
              Yes. One account does both, and you can switch between them from your profile in the app.
            </Question>
            <Question q="When can I start taking bookings?">
              Once your verification is approved. Go online in the app and requests near you start arriving.
            </Question>
            <Question q="Do I have to accept every request?">
              No. You choose which requests to accept. A request you do not answer in time goes back to the owner
              with a full refund.
            </Question>
            <Question q="What if a document is rejected?">
              The app tells you which one and why. Upload a clearer photo and it goes back into review.
            </Question>
          </div>
        </section>
      </Container>
    </>
  );
}
