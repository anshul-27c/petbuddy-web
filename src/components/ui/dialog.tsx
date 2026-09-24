"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconButton } from "./button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** `sheet` rises from the bottom on phones and centres on larger screens; `drawer` slides in from the right. */
  variant?: "sheet" | "drawer";
  /** When false, Esc and the backdrop do not close it (used while a request is in flight). */
  dismissible?: boolean;
}

const SIZES = { sm: "sm:max-w-md", md: "sm:max-w-lg", lg: "sm:max-w-2xl" } as const;

/**
 * A modal built on the native <dialog>: the rest of the page is inert while it
 * is open, focus stays inside, Esc closes it and focus returns to the trigger.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  variant = "sheet",
  dismissible = true,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const pressedOnBackdrop = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onPointerDown={(event) => {
        pressedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && pressedOnBackdrop.current && dismissible) onClose();
        pressedOnBackdrop.current = false;
      }}
      className={cn(
        "border-0 bg-surface p-0 text-ink shadow-float",
        variant === "sheet" &&
          cn(
            "mx-0 mt-auto mb-0 max-h-[92dvh] w-full max-w-none rounded-t-card",
            "sm:m-auto sm:max-h-[88dvh] sm:w-[calc(100%-2rem)] sm:rounded-card",
            SIZES[size],
          ),
        variant === "drawer" && "my-0 mr-0 ml-auto h-dvh max-h-dvh w-full max-w-md rounded-none sm:rounded-l-card",
      )}
    >
      {open ? (
        <div className={cn("flex flex-col", variant === "drawer" ? "h-dvh" : "max-h-[inherit]")}>
          <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-2 sm:px-6 sm:pt-5">
            <div className="min-w-0 pt-2">
              <h2 id={titleId} className="text-subhead font-bold">
                {title}
              </h2>
              {description ? (
                <div id={descriptionId} className="mt-1 text-sm text-ink-muted">
                  {description}
                </div>
              ) : null}
            </div>
            <IconButton label="Close" onClick={onClose} disabled={!dismissible} className="-mr-2">
              <X className="size-5" aria-hidden />
            </IconButton>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-5 sm:px-6">{children}</div>
          {footer ? (
            <div className="border-t border-hairline px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
              {footer}
            </div>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
