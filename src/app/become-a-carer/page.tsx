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
  Siren,
  Smartphone,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { LogoMark } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { useConfig } from "@/lib/queries";
import { PageTitle } from "@/components/layout/page-title";

function JoinStep({ n, icon, title, children }: { n: number; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <li className="group relative flex gap-4 pb-8 last:pb-0">
      <span aria-hidden className="absolute top-12 bottom-0 left-6 w-0.5 -translate-x-1/2 bg-hairline group-last:hidden" />
      <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-sky text-leash [&_svg]:size-5">
        {icon}
      </span>
      <div className="min-w-0 pt-1">
        <p className="text-small font-semibold text-ink-muted">Step {n}</p>
        <h3 className="text-title font-semibold">{title}</h3>
        <div className="mt-1 space-y-2 text-ink-muted">{children}</div>
      </div>
    </li>
  );
}

function Point({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <Card>
      <span className="flex size-11 items-center justify-center rounded-full bg-trail-soft text-trail [&_svg]:size-5" aria-hidden>
        {icon}
      </span>
      <h3 className="mt-3 text-title font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-ink-muted">{children}</p>
    </Card>
  );
}

function Question({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details className="group rounded-card border border-hairline bg-surface p-4 open:pb-5 sm:p-5">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
        {q}
        <span aria-hidden className="text-leash transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="mt-2 text-ink-muted">{children}</div>
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
      <>
        <section className="border-b border-hairline bg-surface">
          <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-sky px-3 py-1 text-small font-semibold text-leash-dark">
                <HandCoins className="size-4" aria-hidden />
                For carers
              </p>
              <h1 className="mt-4 font-display text-[2.5rem] leading-[1.08] font-semibold tracking-tight sm:text-[3.25rem]">
                Earn with PetBuddy
              </h1>
              <p className="mt-4 max-w-xl text-title leading-relaxed text-ink-muted">
                Look after pets near you, on your own hours. Set your own rates, take the bookings you want and get
                paid for every visit.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="#how-to-join" size="lg">
                  How to join
                </ButtonLink>
                <ButtonLink href="#getting-paid" size="lg" variant="outline">
                  How you get paid
                </ButtonLink>
              </div>
            </div>
            <div className="space-y-4 rounded-card border border-hairline bg-canvas p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <LogoMark size="lg" />
                <div>
                  <p className="font-semibold">Carers join in the PetBuddy app</p>
                  <p className="text-sm text-ink-muted">This website is for booking care.</p>
                </div>
              </div>
              <p className="text-sm text-ink-muted">
                Install the PetBuddy app on your phone, sign in with your mobile number and choose{" "}
                <span className="font-semibold text-ink">Earn with PetBuddy</span>. If you already book care with us,
                use the same number: one account does both.
              </p>
            </div>
          </Container>
        </section>

        <Container>
          <section id="how-to-join" aria-labelledby="join-title" className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <h2 id="join-title" className="font-display text-headline font-semibold sm:text-display">
                How to join
              </h2>
              <p className="mt-3 text-ink-muted">
                Five steps, all in the app. Everything saves as you go, so you can stop and come back.
              </p>
            </div>
            <ol>
              <JoinStep n={1} icon={<Smartphone />} title="Sign in and choose to earn">
                <p>Use your mobile number. The same account can book care for your own pets too.</p>
              </JoinStep>
              <JoinStep n={2} icon={<IdCard />} title="Get verified">
                <p>
                  Enter your full name as on your Aadhaar and your date of birth, then upload your Aadhaar and PAN and
                  take a selfie.
                </p>
                <p className="flex items-start gap-2 text-sm">
                  <Camera className="mt-0.5 size-4 shrink-0" aria-hidden />
                  We check that your documents match your name and that your selfie matches your ID. It usually takes
                  one working day, and we let you know as soon as it is done.
                </p>
              </JoinStep>
              <JoinStep n={3} icon={<CalendarClock />} title="Set up your work">
                <p>Pick the services you offer, your hourly rate, how far you will travel and the hours you are free each week.</p>
              </JoinStep>
              <JoinStep n={4} icon={<Landmark />} title="Add where to pay you">
                <p>A UPI ID or a bank account. Only the last four digits of an account number are ever shown back.</p>
              </JoinStep>
              <JoinStep n={5} icon={<Package />} title="Order your starter kit (optional)">
                <p>
                  A printed PetBuddy ID card and two wristbands, posted to you. Owners recognise the card at the door.
                </p>
                <p className="text-sm">
                  {kitPrice ? `A one-time ${kitPrice}, ` : "A one-time charge, "}not a subscription, with a full refund
                  within 7 days of delivery if you change your mind.
                </p>
              </JoinStep>
            </ol>
          </section>

          <section id="getting-paid" aria-labelledby="paid-title" className="mt-16">
            <h2 id="paid-title" className="font-display text-headline font-semibold sm:text-display">
              How you get paid
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Point icon={<HandCoins />} title="Your rate, your call">
                You set an hourly rate and each service is priced from it. Owners see the full price before they pay.
              </Point>
              <Point icon={<BadgeCheck />} title="Clear commission">
                {commission ? `PetBuddy keeps ${commission} of each job. ` : "PetBuddy keeps a set commission on each job. "}
                Tips from owners go to you in full.
              </Point>
              <Point icon={<Wallet />} title="Withdraw to UPI or bank">
                Earnings from a finished job become available after a short hold. Withdraw once you have
                {minWithdrawal ? ` ${minWithdrawal}` : " the minimum"} or more.
              </Point>
            </div>
          </section>

          <section aria-labelledby="safety-title" className="mt-16">
            <h2 id="safety-title" className="font-display text-headline font-semibold sm:text-display">
              Looked after on every job
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Point icon={<Wallet />} title="Paid before you go">
                Owners pay when they book, so every request you accept is already paid for.
              </Point>
              <Point icon={<PhoneOff />} title="Masked numbers">
                You and the owner chat and call without seeing each other&apos;s number.
              </Point>
              <Point icon={<Siren />} title="SOS on live visits">
                If something goes wrong during a visit, the operations team is one tap away.
              </Point>
            </div>
          </section>

          <section aria-labelledby="faq-title" className="mt-16">
            <h2 id="faq-title" className="flex items-center gap-2 font-display text-headline font-semibold">
              <MessageCircleQuestion className="size-6 text-leash" aria-hidden />
              Questions carers ask
            </h2>
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
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
    </>
  );
}
