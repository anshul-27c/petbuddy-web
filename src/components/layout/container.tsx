import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The page column: 16 / 24 / 32 px gutters and a 1216 px cap, shared with the
 * header and footer so every page starts on the same left edge. `narrow` is a
 * centred 672 px column for single-card screens (sign in, not found).
 */
export function Container({
  children,
  className,
  width = "wide",
}: {
  children: ReactNode;
  className?: string;
  width?: "wide" | "narrow";
}) {
  return <div className={cn("container-page", width === "narrow" && "max-w-2xl", className)}>{children}</div>;
}

/**
 * The top of a content page: 24 / 40 px from the header to the title, and
 * 24 / 32 px from the title block to the first section. With `back`, the back
 * link takes the top slot and its text sits where the title would have.
 */
export function PageHeader({
  title,
  subtitle,
  action,
  back,
  meta,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  back?: ReactNode;
  /** A slot beside the title, such as a status pill. */
  meta?: ReactNode;
  className?: string;
}) {
  return (
    // The back link is a 44 px target whose text sits 12 px inside it, so the
    // slot starts 12 px higher (12 / 28) to put that text at the usual 24 / 40.
    <header className={cn("pb-6 sm:pb-8", back ? "pt-3 sm:pt-7" : "pt-6 sm:pt-10", className)}>
      {back ? <div className="mb-1">{back}</div> : null}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="font-display text-headline font-semibold text-ink sm:text-display">{title}</h1>
            {meta}
          </div>
          {subtitle ? <div className="mt-2 text-body text-ink-muted">{subtitle}</div> : null}
        </div>
        {/* The negative margin keeps a 44 px button from making this row taller than a bare title. */}
        {action ? <div className="-my-2 shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}

/** "← All carers": the way back up from a detail page. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-11 items-center gap-2 rounded-field text-sm font-semibold text-leash-dark"
    >
      <ArrowLeft className="size-4 transition-transform duration-150 group-hover:-translate-x-1" aria-hidden />
      <span className="group-hover:underline">{children}</span>
    </Link>
  );
}

/** The back link on its own, at the top of a detail page that draws its own title block. */
export function PageBack({ href, children }: { href: string; children: ReactNode }) {
  return (
    <div className="pt-3 pb-4 sm:pt-7">
      <BackLink href={href}>{children}</BackLink>
    </div>
  );
}
