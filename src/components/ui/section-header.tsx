import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "./button";

/**
 * The one section header used on every page: optional eyebrow, the title
 * (18 px on phones and 20 px from 640 px up; on the landing pages, where each
 * section stands on its own, 24 / 30 px like a page title), an optional
 * subtitle, and an optional action that sits on the title's baseline. It ends
 * with the 16 / 20 px gap to the section's content.
 */
export function SectionHeader({
  id,
  eyebrow,
  title,
  subtitle,
  action,
  as: Tag = "h2",
  inverse = false,
  flush = false,
  landing = false,
  className,
}: {
  id?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  as?: "h2" | "h3";
  /** Light text, for the dark bands. */
  inverse?: boolean;
  /** Drop the gap below, when the header is not followed by content (a band). */
  flush?: boolean;
  /** A section of a landing page: the title is set at page-title size. */
  landing?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(!flush && "mb-4 sm:mb-5", className)}>
      {eyebrow ? (
        <p className={cn("eyebrow mb-2 flex items-center gap-2", inverse ? "text-leash-tint" : "text-leash-dark")}>
          {eyebrow}
        </p>
      ) : null}
      <div className="flex items-baseline justify-between gap-4">
        <Tag
          id={id}
          className={cn(
            "min-w-0 text-balance",
            landing ? "title-page" : "title-section",
            inverse ? "text-surface" : "text-ink",
          )}
        >
          {title}
        </Tag>
        {action ? <div className="-my-2 shrink-0">{action}</div> : null}
      </div>
      {subtitle ? (
        <p className={cn("mt-2 max-w-2xl text-body text-pretty", inverse ? "text-sky/85" : "text-ink-muted")}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The trailing "See all" link in a section header. Its arrow lines up with the
 * right gutter. `label` names it in full for screen readers ("See all carers").
 */
export function SectionLink({ href, children, label }: { href: string; children: ReactNode; label?: string }) {
  return (
    <ButtonLink href={href} variant="ghost" className="group -mr-4" aria-label={label}>
      {children}
      <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden />
    </ButtonLink>
  );
}
