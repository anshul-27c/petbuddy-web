"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, UserX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isOpenSlot, useAvailability } from "@/components/carers/availability-picker";
import { usePay } from "@/components/payments/payment-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { api, isApiError } from "@/lib/api";
import { isConflict } from "@/lib/errors";
import { bookingNotes, firstName } from "@/lib/labels";
import { isPaymentCancelled } from "@/lib/payments/errors";
import { useAddresses, usePets, useServiceCatalogue } from "@/lib/queries";
import { qk } from "@/lib/query-keys";
import type { EarnerDetail, PaymentMethod, ServiceKey } from "@/lib/types";
import { PayPanel } from "./pay-panel";
import { PetStep } from "./pet-step";
import { ServiceStep } from "./service-step";
import { Stepper } from "./stepper";
import { BookingSummary } from "./summary";
import { WhenStep } from "./when-step";
import { WhereStep } from "./where-step";

const SERVICE = 0;
const PET = 1;
const WHEN = 2;
const WHERE = 3;

function Flow({
  earner,
  initialService,
  initialStart,
}: {
  earner: EarnerDetail;
  initialService: ServiceKey | null;
  initialStart: string | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pay = usePay();
  const catalogue = useServiceCatalogue();
  const pets = usePets();
  const addresses = useAddresses();
  const first = firstName(earner.name);

  const onlyService = earner.services.length === 1 ? earner.services[0] : null;
  const startingService =
    initialService && earner.services.includes(initialService) ? initialService : onlyService;

  const [service, setService] = useState<ServiceKey | null>(startingService);
  const [step, setStep] = useState(startingService ? PET : SERVICE);
  const [petId, setPetId] = useState<string | null>(null);
  const [start, setStart] = useState<string | null>(initialStart);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [gateCode, setGateCode] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [conflict, setConflict] = useState<unknown>(null);
  const [payError, setPayError] = useState<unknown>(null);
  const [paying, setPaying] = useState(false);

  const minutes = service ? catalogue.get(service).defaultMinutes : 60;
  // Only send a length once the live catalogue is loaded, so it matches the server's.
  const durationMinutes = service && catalogue.loaded ? minutes : undefined;
  const serviceLabel = service ? catalogue.label(service) : null;

  // Defaults: the only pet, the default address and its gate code.
  const petList = pets.data ?? [];
  const effectivePetId = petId ?? (petList.length === 1 ? petList[0].id : null);
  const pet = petList.find((item) => item.id === effectivePetId) ?? null;
  const addressList = addresses.data ?? [];
  const effectiveAddressId =
    addressId ?? addressList.find((item) => item.isDefault)?.id ?? addressList[0]?.id ?? null;
  const address = addressList.find((item) => item.id === effectiveAddressId) ?? null;
  const effectiveGateCode = gateCode ?? address?.gateCode ?? "";

  // The chosen time only counts while it is still open for this service.
  const availability = useAvailability(earner.id, service ?? undefined);
  const slotOpen = service !== null && isOpenSlot(availability.data, start);

  const quote = useQuery({
    queryKey: qk.quote(earner.id, service ?? "walking", durationMinutes ?? 0),
    queryFn: () => api.bookings.quote({ earnerId: earner.id, service: service!, durationMinutes }),
    enabled: service !== null,
  });

  const complete = [service !== null, pet !== null, slotOpen, address !== null];
  const canOpen = (target: number) => complete.slice(0, target).every(Boolean);

  const create = useMutation({ mutationFn: api.bookings.create });

  const book = async () => {
    if (paying || !service || !pet || !address || !start || !quote.data) return;
    setPaying(true);
    setPayError(null);
    setConflict(null);
    try {
      const proof = await pay({
        amountPaise: quote.data.totalPaise,
        purpose: "booking",
        description: `${serviceLabel} for ${pet.name}`,
        method,
      });
      const booking = await create.mutateAsync({
        earnerId: earner.id,
        petId: pet.id,
        addressId: address.id,
        service,
        start,
        durationMinutes,
        notes: bookingNotes(notes, effectiveGateCode),
        payment: proof,
      });
      queryClient.setQueryData(qk.booking(booking.id), booking);
      void queryClient.invalidateQueries({ queryKey: qk.bookingsAll });
      void queryClient.invalidateQueries({ queryKey: qk.availabilityAll(earner.id) });
      void queryClient.invalidateQueries({ queryKey: qk.earner(earner.id) });
      void queryClient.invalidateQueries({ queryKey: qk.chatsAll });
      router.replace(`/bookings/${booking.id}?confirmed=1`);
    } catch (error) {
      setPaying(false);
      if (isPaymentCancelled(error)) return;
      if (isConflict(error, "E_PRICE_CHANGED")) {
        setPayError(error);
        void quote.refetch();
      } else if (isConflict(error)) {
        // The slot went (or the carer went offline): show why and pick again.
        setConflict(error);
        setStart(null);
        void queryClient.invalidateQueries({ queryKey: qk.availabilityAll(earner.id) });
        setStep(WHEN);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setPayError(error);
      }
    }
  };

  const goTo = (target: number) => {
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
      <div className="min-w-0">
        <Stepper current={step} canOpen={canOpen} onOpen={goTo} />

        {!earner.isOnline ? (
          <Notice tone="warning" title={`${first} is not taking bookings right now`} className="mt-6">
            You can look around, but the booking will not go through until they are back online.{" "}
            <Link href="/carers" className="font-semibold text-leash-dark underline">
              Find another carer
            </Link>
          </Notice>
        ) : null}

        <div key={step} className="mt-8 animate-rise-in">
          {step === SERVICE ? (
            <ServiceStep
              earner={earner}
              value={service}
              onChange={(next) => {
                setService(next);
                setPayError(null);
              }}
            />
          ) : null}
          {step === PET ? <PetStep value={effectivePetId} onChange={setPetId} /> : null}
          {step === WHEN && service ? (
            <WhenStep
              earnerId={earner.id}
              carerName={first}
              service={service}
              serviceLabel={serviceLabel ?? ""}
              minutes={minutes}
              value={start}
              onChange={(slot) => {
                setStart(slot.start);
                setConflict(null);
              }}
              conflict={conflict}
            />
          ) : null}
          {step === WHERE ? (
            <div className="space-y-8">
              <WhereStep
                carerName={first}
                addressId={effectiveAddressId}
                onAddress={setAddressId}
                gateCode={effectiveGateCode}
                onGateCode={setGateCode}
                notes={notes}
                onNotes={setNotes}
              />
              {address ? (
                <div className="lg:hidden">
                  <BookingSummary
                    earner={earner}
                    serviceLabel={serviceLabel}
                    pet={pet}
                    start={slotOpen ? start : null}
                    minutes={minutes}
                    address={address}
                    totalPaise={null}
                  />
                </div>
              ) : null}
              {address ? (
                <PayPanel
                  quote={quote}
                  serviceLabel={serviceLabel ?? ""}
                  method={method}
                  onMethod={setMethod}
                  onPay={() => void book()}
                  busy={paying}
                  error={payError}
                  ready={complete.every(Boolean) && earner.isOnline}
                />
              ) : null}
              {!slotOpen && availability.data ? (
                <Notice tone="warning" title="That time is no longer free">
                  Go back to When and pick another time.
                </Notice>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-hairline pt-6">
          {step > SERVICE && !(step === PET && onlyService) ? (
            <Button variant="outline" onClick={() => goTo(step - 1)} icon={<ArrowLeft className="size-4" aria-hidden />}>
              Back
            </Button>
          ) : (
            <ButtonLink href={`/carers/${earner.id}`} variant="outline" icon={<ArrowLeft className="size-4" aria-hidden />}>
              Back to {first}
            </ButtonLink>
          )}
          {step < WHERE ? (
            <Button onClick={() => goTo(step + 1)} disabled={!complete[step]} className="group">
              Next
              <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden />
            </Button>
          ) : null}
        </div>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <BookingSummary
            earner={earner}
            serviceLabel={serviceLabel}
            pet={pet}
            start={slotOpen ? start : null}
            minutes={minutes}
            address={address}
            totalPaise={quote.data?.totalPaise ?? null}
          />
        </div>
      </aside>
    </div>
  );
}

export function BookingFlow({
  earnerId,
  initialService,
  initialStart,
}: {
  earnerId: string;
  initialService: ServiceKey | null;
  initialStart: string | null;
}) {
  const query = useQuery({ queryKey: qk.earner(earnerId), queryFn: () => api.earners.get(earnerId) });

  if (query.data) {
    return <Flow earner={query.data} initialService={initialService} initialStart={initialStart} />;
  }
  if (query.isError) {
    if (isApiError(query.error) && query.error.status === 404) {
      return (
        <EmptyState
          icon={<UserX />}
          title="This carer is not on PetBuddy any more"
          body="Their profile may have been removed. There are plenty of other carers near you."
          action={<ButtonLink href="/carers">Find another carer</ButtonLink>}
        />
      );
    }
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} retrying={query.isFetching} />;
  }
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10" role="status" aria-label="Loading">
      <div>
        <Skeleton className="h-20 w-full rounded-card" />
        <Skeleton className="mt-8 h-8 w-1/2" />
        <div className="mt-5 space-y-3">
          <CardSkeleton lines={1} />
          <CardSkeleton lines={1} />
        </div>
      </div>
      <Skeleton className="hidden h-72 rounded-card lg:block" />
    </div>
  );
}
