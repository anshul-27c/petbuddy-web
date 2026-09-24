"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { CircleAlert, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { errorCopy } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-card border border-dashed border-hairline bg-surface px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-sky text-leash [&_svg]:size-6">
        {icon}
      </div>
      <h3 className="mt-4 text-title font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  retrying = false,
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}) {
  const { title, body } = errorCopy(error);
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center rounded-card border border-hairline bg-surface px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-alert-soft text-alert">
        <CircleAlert className="size-6" aria-hidden />
      </div>
      <h3 className="mt-4 text-title font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{body}</p>
      {onRetry ? (
        <Button
          variant="outline"
          className="mt-5"
          onClick={onRetry}
          loading={retrying}
          icon={<RotateCcw className="size-4" aria-hidden />}
        >
          Try again
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Renders the four states of a query: loading, error with retry, empty and
 * content. Cached data stays on screen while a background refetch runs.
 */
export function QueryView<T>({
  query,
  loading,
  isEmpty,
  empty,
  children,
  errorClassName,
}: {
  query: Pick<UseQueryResult<T>, "data" | "error" | "isError" | "isFetching" | "refetch">;
  loading: ReactNode;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
  errorClassName?: string;
}) {
  if (query.data === undefined) {
    if (query.isError) {
      return (
        <ErrorState
          error={query.error}
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
          className={errorClassName}
        />
      );
    }
    return <>{loading}</>;
  }
  if (isEmpty && isEmpty(query.data)) return <>{empty}</>;
  return <>{children(query.data)}</>;
}
