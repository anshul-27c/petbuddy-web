"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { usePay } from "@/components/payments/payment-provider";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Dialog } from "@/components/ui/dialog";
import { TextArea } from "@/components/ui/field";
import { ErrorNotice } from "@/components/ui/notice";
import { StarInput } from "@/components/ui/stars";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { firstName } from "@/lib/labels";
import { isPaymentCancelled } from "@/lib/payments/errors";
import { qk } from "@/lib/query-keys";
import type { Booking, PaymentMethod, RateInput } from "@/lib/types";
import { PaymentMethodPicker } from "./payment-method-picker";
import { useBookingRefresh } from "./use-booking-refresh";

const TIPS = [0, 2000, 5000, 10000];

/** Rate the visit and, optionally, tip. A tip is paid first and sent as `tipPayment`. */
export function RateDialog({ booking, open, onClose }: { booking: Booking; open: boolean; onClose: () => void }) {
  const first = firstName(booking.earner.name);
  const pay = usePay();
  const refresh = useBookingRefresh();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [tip, setTip] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const rate = useMutation({
    mutationFn: (input: RateInput) => api.bookings.rate(booking.id, input),
    onSuccess: (updated) => {
      refresh(updated);
      void queryClient.invalidateQueries({ queryKey: qk.earner(booking.earner.id) });
      void queryClient.invalidateQueries({ queryKey: qk.reviews(booking.earner.id) });
      toast({
        title: `Thanks for rating ${first}`,
        body: tip > 0 ? `Your ${formatMoney(tip)} tip goes to ${first} in full.` : undefined,
      });
      onClose();
    },
  });

  const busy = paying || rate.isPending;

  const submit = async () => {
    if (busy || rating === 0) return;
    setError(null);
    try {
      let tipPayment;
      if (tip > 0) {
        setPaying(true);
        tipPayment = await pay({ amountPaise: tip, purpose: "tip", description: `Tip for ${first}`, method });
      }
      await rate.mutateAsync({ rating, text: text.trim() || null, tipPaise: tip, tipPayment });
    } catch (caught) {
      if (!isPaymentCancelled(caught)) setError(caught);
    } finally {
      setPaying(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="How did it go?"
      description={`Your rating is shown on ${first}'s profile.`}
      dismissible={!busy}
      footer={
        <Button
          variant={tip > 0 ? "accent" : "primary"}
          size="lg"
          block
          onClick={() => void submit()}
          loading={busy}
          disabled={rating === 0}
        >
          {tip > 0 ? `Pay ${formatMoney(tip)} tip and submit` : "Submit rating"}
        </Button>
      }
    >
      <div className="space-y-5">
        <div>
          <StarInput value={rating} onChange={setRating} label={`Rate ${first}`} />
          <p className="mt-1 text-center text-sm text-ink-muted" aria-live="polite">
            {rating === 0 ? "Tap a star" : `${rating} out of 5`}
          </p>
        </div>
        <TextArea
          label="Anything to add?"
          optional
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="What went well, or what could be better"
          maxLength={1000}
          rows={3}
        />
        <fieldset>
          <legend className="text-sm font-semibold">Add a tip</legend>
          <p className="text-small text-ink-muted">Tips go to your carer in full.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TIPS.map((amount) => (
              <Chip key={amount} selected={tip === amount} onClick={() => setTip(amount)}>
                {amount === 0 ? "No tip" : formatMoney(amount)}
              </Chip>
            ))}
          </div>
        </fieldset>
        {tip > 0 ? <PaymentMethodPicker value={method} onChange={setMethod} disabled={busy} compact /> : null}
        {error ? <ErrorNotice error={error} /> : null}
      </div>
    </Dialog>
  );
}
