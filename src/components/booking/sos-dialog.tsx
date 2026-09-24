"use client";

import { useMutation } from "@tanstack/react-query";
import { CircleCheck, Siren } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { TextArea } from "@/components/ui/field";
import { ErrorNotice } from "@/components/ui/notice";
import { api } from "@/lib/api";
import { formatPhone } from "@/lib/format";
import type { Booking } from "@/lib/types";

/** Raises an urgent incident, then says exactly what happens next. */
export function SosDialog({ booking, open, onClose }: { booking: Booking; open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const sos = useMutation({ mutationFn: () => api.bookings.sos(booking.id, note.trim() || null) });

  const close = () => {
    onClose();
    if (sos.isSuccess) {
      sos.reset();
      setNote("");
    }
  };

  if (sos.isSuccess) {
    return (
      <Dialog
        open={open}
        onClose={close}
        title="Help is on the way"
        size="sm"
        footer={
          <Button block size="lg" onClick={close}>
            Done
          </Button>
        }
      >
        <div className="flex items-center gap-3 rounded-field bg-trail-soft p-3.5 text-trail">
          <CircleCheck className="size-6 shrink-0" aria-hidden />
          <p className="text-sm font-semibold">Your alert reached the PetBuddy operations team.</p>
        </div>
        <h3 className="mt-5 text-title font-semibold">What happens next</h3>
        <ol className="mt-3 space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky text-label font-bold text-leash-dark">
              1
            </span>
            The team can see this booking, your carer and the live location.
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky text-label font-bold text-leash-dark">
              2
            </span>
            They will call you{user?.phone ? ` on ${formatPhone(user.phone)}` : ""} as soon as they can. Keep your
            phone close.
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky text-label font-bold text-leash-dark">
              3
            </span>
            If anyone is hurt or in danger, contact local emergency services first.
          </li>
        </ol>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Need help right now?"
      size="sm"
      dismissible={!sos.isPending}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={close} disabled={sos.isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => sos.mutate()}
            loading={sos.isPending}
            icon={<Siren className="size-4" aria-hidden />}
          >
            Send SOS
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-body">
          This alerts the PetBuddy operations team straight away, with this booking&apos;s details and your
          carer&apos;s live location.
        </p>
        <TextArea
          label="What is happening?"
          optional
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Carer is not answering"
          maxLength={500}
          rows={3}
        />
        {sos.error ? <ErrorNotice error={sos.error} /> : null}
      </div>
    </Dialog>
  );
}
