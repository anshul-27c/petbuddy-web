"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { CircleAlert, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { errorCopy } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/**
 * The space a page's empty or error state owns: everything between what sits
 * above it (the page header, filters) and the footer. It grows to fill the
 * page and centres its box in both directions. It eats the page's usual
 * 64 / 96 px bottom padding and keeps 24 / 32 px instead, the same as the page
 * header leaves above it, so the gaps above and below the box match.
 */
export function StateArea({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("state-area flex flex-1 flex-col items-center justify-center", className)}>
      <div className="w-full max-w-xl">{children}</div>
    </div>
  );
}

function StateBox({
  tone,
  icon,
  title,
  body,
  action,
  compact,
  bare,
  role,
  className,
}: {
  tone: "empty" | "error";
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
  compact?: boolean;
  bare?: boolean;
  role?: "alert";
  className?: string;
}) {
  return (
    <div
      role={role}
      className={cn(
        "relative isolate flex flex-col items-center overflow-hidden rounded-card px-6 text-center",
        compact ? "py-8" : "py-12",
        !bare && "bg-surface",
        !bare && (tone === "empty" ? "border border-dashed border-hairline" : "border border-hairline shadow-card"),
        className,
      )}
    >
      {tone === "empty" && !bare ? <div aria-hidden className="bg-dot-grid absolute inset-0 -z-10 opacity-70" /> : null}
      <div
        aria-hidden
        className={cn(
          "flex size-14 items-center justify-center rounded-card [&_svg]:size-6",
          tone === "empty" ? "bg-sky text-leash shadow-card ring-8 ring-sky/50" : "bg-alert-soft text-alert ring-8 ring-alert-soft/50",
        )}
      >
        {icon}
      </div>
      <h3 className="mt-6 text-base font-semibold text-balance text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-pretty text-ink-muted">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

/**
 * An empty list: an icon on a tinted squircle over a faint dot grid, a line of
 * copy and an optional action. With `fill` it is the page's main content and
 * sits centred in the space it owns (see StateArea).
 */
export function EmptyState({
  icon,
  title,
  body,
  action,
  fill = false,
  areaClassName,
  compact = false,
  className,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
  fill?: boolean;
  /** Extra room above the box, when what sits above it leaves less than the page header does. */
  areaClassName?: string;
  /** Less padding, inside a card or a dialog. */
  compact?: boolean;
  className?: string;
}) {
  const box = (
    <StateBox tone="empty" icon={icon} title={title} body={body} action={action} compact={compact} className={className} />
  );
  return fill ? <StateArea className={areaClassName}>{box}</StateArea> : box;
}

export function ErrorState({
  error,
  onRetry,
  retrying = false,
  compact = false,
  bare = false,
  fill = false,
  areaClassName,
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  retrying?: boolean;
  /** Less padding, for errors inside a card. */
  compact?: boolean;
  /** No border or shadow, for errors inside a menu. */
  bare?: boolean;
  /** The page's main content: centred in the space it owns. */
  fill?: boolean;
  areaClassName?: string;
  className?: string;
}) {
  const { title, body } = errorCopy(error);
  const box = (
    <StateBox
      tone="error"
      role="alert"
      icon={<CircleAlert />}
      title={title}
      body={body}
      compact={compact}
      bare={bare}
      className={className}
      action={
        onRetry ? (
          <Button variant="outline" onClick={onRetry} loading={retrying} icon={<RotateCcw className="size-4" aria-hidden />}>
            Try again
          </Button>
        ) : undefined
      }
    />
  );
  return fill ? <StateArea className={areaClassName}>{box}</StateArea> : box;
}

/**
 * Renders the four states of a query: loading, error with retry, empty and
 * content. Cached data stays on screen while a background refetch runs. With
 * `fill`, the error state is the page's main content (the empty one says so
 * itself, with its own `fill`).
 */
export function QueryView<T>({
  query,
  loading,
  isEmpty,
  empty,
  children,
  fill = false,
  errorClassName,
}: {
  query: Pick<UseQueryResult<T>, "data" | "error" | "isError" | "isFetching" | "refetch">;
  loading: ReactNode;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
  fill?: boolean;
  errorClassName?: string;
}) {
  if (query.data === undefined) {
    if (query.isError) {
      return (
        <ErrorState
          error={query.error}
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
          fill={fill}
          className={errorClassName}
        />
      );
    }
    return <>{loading}</>;
  }
  if (isEmpty && isEmpty(query.data)) return <>{empty}</>;
  return <>{children(query.data)}</>;
}
