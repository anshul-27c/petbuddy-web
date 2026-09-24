"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { TextArea } from "@/components/ui/field";
import { ErrorNotice, Notice } from "@/components/ui/notice";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { usePolicy } from "@/lib/queries";
import type { Booking } from "@/lib/types";
import { useBookingRefresh } from "./use-booking-refresh";

/** States the fee before the person commits, using the server's figure for "now". */
export function CancelDialog({ booking, open, onClose }: { booking: Booking; open: boolean; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const refresh = useBookingRefresh();
  const toast = useToast();
  const { freeCancelHours } = usePolicy();
  const fee = booking.cancellationFeeIfNowPaise;
  const hours = `${freeCancelHours} ${freeCancelHours === 1 ? "hour" : "hours"}`;

  const cancel = useMutation({
    mutationFn: () => api.bookings.cancel(booking.id, reason.trim() || null),
    onSuccess: (updated) => {
      refresh(updated);
      const refund = updated.cancellation?.refundPaise;
      toast({
        title: "Booking cancelled",
        body:
          refund !== undefined && refund > 0
            ? `${formatMoney(refund)} will be refunded to your original payment method.`
            : undefined,
      });
      onClose();
    },
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Cancel this booking?"
      size="sm"
      dismissible={!cancel.isPending}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={cancel.isPending}>
            Keep booking
          </Button>
          <Button variant="danger" onClick={() => cancel.mutate()} loading={cancel.isPending}>
            {fee > 0 ? `Cancel and pay ${formatMoney(fee)} fee` : "Cancel booking"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {fee > 0 ? (
          <Notice tone="warning" title={`A ${formatMoney(fee)} fee applies`}>
            The visit is less than {hours} away, so {formatMoney(fee)} is kept as a cancellation fee. The rest of
            what you paid is refunded.
          </Notice>
        ) : (
          <Notice tone="success" title="Cancelling now is free">
            You get a full refund of {formatMoney(booking.price.totalPaise)} to your original payment method.
          </Notice>
        )}
        <TextArea
          label="Why are you cancelling?"
          optional
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Plans changed"
          maxLength={500}
          rows={3}
        />
        {cancel.error ? <ErrorNotice error={cancel.error} /> : null}
      </div>
    </Dialog>
  );
}
