"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Calls `onEnter` once, the first time the element scrolls into view. Runs
 * straight away when observers are unavailable or motion is reduced.
 */
function useOnceInView<T extends Element>(onEnter: (element: T) => void, rootMargin = "0px 0px -8% 0px") {
  const ref = useRef<T>(null);
  const callback = useRef(onEnter);
  useLayoutEffect(() => {
    callback.current = onEnter;
  });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      callback.current(element);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          callback.current(element);
        }
      },
      { rootMargin, threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);
  return ref;
}

/**
 * Blur-fade entrance for a section as it enters the viewport, once. Direct
 * children marked with `data-reveal-item` (see `revealItem`) rise in one after
 * another; with `self`, the element itself rises in.
 */
export function Reveal({
  as,
  self = false,
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  self?: boolean;
  className?: string;
  children?: ReactNode;
} & Record<string, unknown>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useOnceInView<HTMLElement>((element) => element.setAttribute("data-shown", ""));
  return (
    <Tag ref={ref} className={cn("reveal", className)} data-reveal-self={self ? "" : undefined} {...rest}>
      {children}
    </Tag>
  );
}

/** Props for one staggered child of <Reveal>. */
export function revealItem(index: number): { "data-reveal-item": ""; style: CSSProperties } {
  return { "data-reveal-item": "", style: { "--i": Math.min(index, 8) } as CSSProperties };
}

/**
 * A number that counts up from zero when it scrolls into view. The final
 * value is what assistive tech reads and what shows without motion.
 */
export function CountUp({
  value,
  format = (n) => String(Math.round(n)),
  duration = 900,
  className,
}: {
  value: number;
  format?: (value: number) => string;
  duration?: number;
  className?: string;
}) {
  const text = format(value);
  const latest = useRef({ value, format });
  const counted = useRef(false);
  useLayoutEffect(() => {
    latest.current = { value, format };
  });

  const ref = useOnceInView<HTMLSpanElement>((element) => {
    counted.current = true;
    const target = latest.current.value;
    if (prefersReducedMotion() || target === 0) {
      element.textContent = latest.current.format(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = latest.current.format(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else element.textContent = latest.current.format(latest.current.value);
    };
    requestAnimationFrame(tick);
  });

  // The visible figure is written here rather than rendered, so the count-up
  // and React never fight over the same text node. Before the count it reads
  // zero; after it, it follows the value.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const settled = counted.current || prefersReducedMotion();
    element.textContent = settled ? text : latest.current.format(0);
  }, [ref, text]);

  return (
    <span className={cn("tabular-nums", className)}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden />
    </span>
  );
}

/** Feeds the pointer position to a `.spotlight` card as --mx / --my. */
export function trackPointer(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== "mouse") return;
  const element = event.currentTarget;
  const box = element.getBoundingClientRect();
  element.style.setProperty("--mx", `${event.clientX - box.left}px`);
  element.style.setProperty("--my", `${event.clientY - box.top}px`);
}
