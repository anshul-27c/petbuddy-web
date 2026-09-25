"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { MessageSquareQuote, Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ListSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { CountUp } from "@/components/ui/motion";
import { StarRow } from "@/components/ui/stars";
import { api } from "@/lib/api";
import { formatAgo, formatCount, formatRating } from "@/lib/format";
import { useServiceCatalogue } from "@/lib/queries";
import { qk } from "@/lib/query-keys";
import type { Review, ReviewSummary } from "@/lib/types";

export function ReviewSummaryBlock({ summary }: { summary: ReviewSummary }) {
  const total = summary.total || 0;
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
      <div className="flex flex-col items-center sm:items-start">
        <p className="font-display text-display font-semibold">
          <CountUp value={summary.average} format={(n) => formatRating(n)} />
        </p>
        <StarRow value={summary.average} className="mt-1" />
        <p className="mt-2 text-sm text-ink-muted">
          {formatCount(total)} {total === 1 ? "review" : "reviews"}
        </p>
      </div>
      <ul className="space-y-2" aria-label="How people rated">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = summary.distribution[stars - 1] ?? 0;
          const width = total ? Math.round((count / total) * 100) : 0;
          return (
            <li key={stars} className="flex items-center gap-2 text-sm">
              <span className="inline-flex w-8 items-center gap-1 tabular-nums text-ink-muted">
                {stars}
                <Star className="size-3.5 fill-amber text-amber" aria-hidden />
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-canvas" aria-hidden>
                <span
                  className="block h-full origin-left rounded-full bg-linear-to-r from-amber/70 to-amber"
                  style={{ width: `${width}%` }}
                />
              </span>
              <span className="w-10 text-right tabular-nums text-ink-muted">
                {formatCount(count)}
                <span className="sr-only"> with {stars} {stars === 1 ? "star" : "stars"}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ReviewItem({ review, carerFirstName }: { review: Review; carerFirstName: string }) {
  const catalogue = useServiceCatalogue();
  return (
    <article className="py-5">
      <div className="flex items-start gap-3">
        <Avatar name={review.authorName} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="font-semibold">{review.authorName}</p>
            <p className="text-small text-ink-muted">{formatAgo(review.at)}</p>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StarRow value={review.rating} />
            <span className="text-small text-ink-muted">{catalogue.label(review.service)}</span>
          </div>
          {review.text ? <p className="mt-2 text-body whitespace-pre-line">{review.text}</p> : null}
          {review.reply ? (
            <div className="mt-3 rounded-field border-l-2 border-leash-tint bg-mist p-3">
              <p className="text-small font-semibold text-ink-muted">Reply from {carerFirstName}</p>
              <p className="mt-1 text-sm whitespace-pre-line">{review.reply}</p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function NoReviews() {
  return (
    <EmptyState
      icon={<MessageSquareQuote />}
      title="No reviews yet"
      body="This carer has not been reviewed on PetBuddy yet. Their ID has still been checked."
    />
  );
}

/** Every review, ten at a time. */
export function AllReviewsDialog({
  earnerId,
  carerFirstName,
  open,
  onClose,
}: {
  earnerId: string;
  carerFirstName: string;
  open: boolean;
  onClose: () => void;
}) {
  const query = useInfiniteQuery({
    queryKey: qk.reviews(earnerId),
    queryFn: ({ pageParam }) => api.earners.reviews(earnerId, pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.currentPage < last.meta.lastPage ? last.meta.currentPage + 1 : undefined,
    enabled: open,
  });

  const reviews = query.data?.pages.flatMap((page) => page.data.reviews) ?? [];
  const summary = query.data?.pages[0]?.data.summary;

  return (
    <Dialog open={open} onClose={onClose} title={`Reviews for ${carerFirstName}`} size="lg">
      {query.data === undefined ? (
        query.isError ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} retrying={query.isFetching} />
        ) : (
          <ListSkeleton count={3} />
        )
      ) : reviews.length === 0 ? (
        <NoReviews />
      ) : (
        <div>
          {summary ? (
            <div className="border-b border-hairline pb-5">
              <ReviewSummaryBlock summary={summary} />
            </div>
          ) : null}
          <div className="divide-y divide-hairline">
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} carerFirstName={carerFirstName} />
            ))}
          </div>
          {query.hasNextPage ? (
            <Button
              variant="outline"
              block
              className="mt-2"
              onClick={() => void query.fetchNextPage()}
              loading={query.isFetchingNextPage}
            >
              Show more reviews
            </Button>
          ) : (
            <p className="pt-2 text-center text-small text-ink-muted">That is every review so far.</p>
          )}
          {query.isFetchNextPageError ? (
            <p className="mt-2 text-center text-sm text-alert">Could not load more reviews. Try again.</p>
          ) : null}
        </div>
      )}
    </Dialog>
  );
}
