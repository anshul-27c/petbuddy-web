import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { errorCopy } from "@/lib/errors";

type Tone = "info" | "success" | "warning" | "error";

const TONES: Record<Tone, string> = {
  info: "bg-sky text-leash-dark",
  success: "bg-trail-soft text-trail",
  warning: "bg-amber-soft text-amber",
  error: "bg-alert-soft text-alert",
};

const ICONS: Record<Tone, ReactNode> = {
  info: <Info className="size-5" aria-hidden />,
  success: <CircleCheck className="size-5" aria-hidden />,
  warning: <TriangleAlert className="size-5" aria-hidden />,
  error: <CircleAlert className="size-5" aria-hidden />,
};

/** An inline message on a tinted background. */
export function Notice({
  tone = "info",
  title,
  children,
  action,
  className,
  role,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
  role?: "alert" | "status";
}) {
  return (
    <div role={role} className={cn("flex gap-3 rounded-field p-3.5 sm:p-4", TONES[tone], className)}>
      <div className="shrink-0 pt-px">{ICONS[tone]}</div>
      <div className="min-w-0 flex-1 text-sm">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title ? "mt-0.5" : "", "text-ink")}>{children}</div> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}

/** A server or network error shown inline: `message` as the title, `action` as the body. */
export function ErrorNotice({ error, className }: { error: unknown; className?: string }) {
  if (!error) return null;
  const { title, body } = errorCopy(error);
  return (
    <Notice tone="error" title={title} className={className} role="alert">
      {body}
    </Notice>
  );
}
