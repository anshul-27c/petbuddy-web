import { cn } from "@/lib/utils";

/** A pulsing placeholder block. Shape it like the content it stands in for. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-field bg-hairline", className)} />;
}

/** A card-shaped skeleton with a few lines, for lists. */
export function CardSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("rounded-card border border-hairline bg-surface p-4 sm:p-5", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-1/2" : "w-full")} />
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Neutral page placeholder used while the sign-in state is being read. */
export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6" role="status" aria-label="Loading">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
