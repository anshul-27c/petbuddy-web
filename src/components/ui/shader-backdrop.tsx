"use client";

import { useEffect, useRef } from "react";
import type { AuroraTone } from "@/lib/aurora-gl";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "./motion";

/**
 * The living background behind a hero or a band: a CSS aurora first, then a
 * WebGL version fades in over it once the shader module has loaded and drawn.
 * Motion pauses off-screen and in hidden tabs; with reduced motion the shader
 * draws one still frame. Decorative, so hidden from assistive tech.
 */
export function ShaderBackdrop({
  tone = "day",
  dots = true,
  className,
}: {
  tone?: AuroraTone;
  dots?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let stop: (() => void) | null = null;
    let cancelled = false;
    import("@/lib/aurora-gl")
      .then(({ startAurora }) => {
        if (cancelled) return;
        stop = startAurora(canvas, {
          tone,
          animate: !prefersReducedMotion(),
          onReady: () => canvas.setAttribute("data-ready", ""),
        });
      })
      .catch(() => {
        // The CSS aurora underneath stays as it is.
      });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [tone]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        tone === "day" ? "bg-aurora" : "bg-aurora-night",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full opacity-0 transition-opacity duration-700 ease-out data-ready:opacity-100"
      />
      {dots ? <div className={cn("absolute inset-0", tone === "day" ? "bg-dot-grid" : "bg-dot-grid-light")} /> : null}
    </div>
  );
}
