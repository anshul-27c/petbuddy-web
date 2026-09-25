import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

/** A placeholder block with a slow sweep of light. Shape it like the content it stands in for. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-field", className)} />;
}

/** A card-shaped skeleton with a few lines, for lists. Same padding as <Card>. */
export function CardSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("rounded-card border border-hairline bg-surface p-4 shadow-card sm:p-5", className)}>
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
    <div className={cn("grid grid-cols-1 gap-3 sm:gap-4", className)} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

const PAWS = [
  { x: 0, y: 24, r: -18 },
  { x: 22, y: 6, r: -18 },
  { x: 44, y: 24, r: 14 },
  { x: 66, y: 6, r: 14 },
];

/** Four paw prints stepping across, for a whole page that is still loading. */
export function PawLoader({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-label={label} className={cn("relative h-12 w-24", className)}>
      {PAWS.map((paw, index) => (
        <PawPrint
          key={index}
          aria-hidden
          className="absolute size-6 text-leash opacity-0 motion-safe:animate-[paw-step_1.6s_ease-in-out_infinite] motion-reduce:opacity-60"
          style={{ left: paw.x, top: paw.y, rotate: `${paw.r + 90}deg`, animationDelay: `${index * 0.2}s` }}
        />
      ))}
    </div>
  );
}

/** Neutral page placeholder used while the sign-in state is being read. */
export function PageSkeleton() {
  return (
    <div className="container-page flex min-h-[60dvh] items-center justify-center py-16">
      <PawLoader />
    </div>
  );
}
