"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

interface TriggerProps {
  "aria-expanded": boolean;
  "aria-controls": string;
  onClick: () => void;
  ref: RefObject<HTMLButtonElement | null>;
}

/**
 * A disclosure panel for header menus. Closes on outside press, Esc (returning
 * focus to the trigger) and on navigation.
 */
export function Popover({
  trigger,
  children,
  panelClassName,
}: {
  trigger: (props: TriggerProps) => ReactNode;
  children: (close: () => void) => ReactNode;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {trigger({
        "aria-expanded": open,
        "aria-controls": panelId,
        onClick: () => setOpen((value) => !value),
        ref: triggerRef,
      })}
      <div
        id={panelId}
        hidden={!open}
        className={cn(
          "z-50 rounded-card border border-hairline bg-surface shadow-float",
          panelClassName ?? "absolute top-full right-0 mt-2 w-72 p-2",
        )}
      >
        {open ? children(() => setOpen(false)) : null}
      </div>
    </div>
  );
}
