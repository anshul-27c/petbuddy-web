"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RatingInline } from "@/components/ui/stars";
import { api } from "@/lib/api";
import { formatMaskedPhone } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import type { Booking } from "@/lib/types";

/** The carer, their masked number (calls go through the app) and a way to chat. */
export function CarerContact({ booking }: { booking: Booking }) {
  const thread = useQuery({
    queryKey: qk.bookingChat(booking.id),
    queryFn: () => api.bookings.chat(booking.id),
    staleTime: 5 * 60_000,
  });
  const threadId = thread.data?.id ?? booking.chatThreadId;
  const masked = thread.data?.maskedPhone ? formatMaskedPhone(thread.data.maskedPhone) : null;

  return (
    <Card>
      <Link href={`/carers/${booking.earner.id}`} className="flex items-center gap-3 rounded-field">
        <Avatar name={booking.earner.name} size="lg" verified={booking.earner.idVerified} />
        <div className="min-w-0">
          <p className="truncate font-semibold hover:underline">{booking.earner.name}</p>
          <RatingInline rating={booking.earner.rating} count={booking.earner.reviewCount} />
        </div>
      </Link>
      <div className="mt-4 grid gap-2">
        {threadId ? (
          <ButtonLink
            href={`/messages/${threadId}`}
            variant="tonal"
            icon={<MessageCircle className="size-4" aria-hidden />}
          >
            Chat with {booking.earner.name.split(" ")[0]}
          </ButtonLink>
        ) : (
          <Button variant="tonal" disabled icon={<MessageCircle className="size-4" aria-hidden />}>
            Chat
          </Button>
        )}
        <Button
          variant="outline"
          disabled
          icon={<Phone className="size-4" aria-hidden />}
          aria-describedby="call-note"
          className="tabular-nums"
        >
          {masked ? `Call ${masked}` : "Call"}
        </Button>
      </div>
      <p id="call-note" className="mt-2 text-small text-ink-muted">
        Calls use a masked number, so neither of you sees the other&apos;s. Calling works in the PetBuddy app, not on
        the website yet.
      </p>
    </Card>
  );
}
