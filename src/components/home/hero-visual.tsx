import { Camera, Footprints, Home, ShieldCheck } from "lucide-react";

/**
 * A decorative sketch of a live visit: the same schematic map the booking
 * page uses, with a status card and a photo update. Hidden from assistive tech.
 */
export function HeroVisual() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md select-none">
      <div className="overflow-hidden rounded-panel border border-surface/80 bg-surface/60 p-2 shadow-float backdrop-blur">
        <div className="relative overflow-hidden rounded-card bg-sky">
          <svg viewBox="0 0 400 260" className="block h-auto w-full">
            <defs>
              <pattern id="hero-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M32 0H0V32" fill="none" stroke="var(--color-leash-tint)" strokeWidth="1" />
              </pattern>
              <radialGradient id="hero-glow" cx="0.65" cy="0.5" r="0.5">
                <stop offset="0" stopColor="var(--color-surface)" stopOpacity="0.9" />
                <stop offset="1" stopColor="var(--color-surface)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="400" height="260" fill="url(#hero-grid)" />
            <rect width="400" height="260" fill="url(#hero-glow)" />
            <path
              d="M20 200 C 120 180, 150 90, 250 110 S 360 60, 390 40"
              fill="none"
              stroke="var(--color-surface)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M112 176 C 160 150, 190 120, 262 136"
              fill="none"
              stroke="var(--color-leash)"
              strokeWidth="3"
              strokeDasharray="6 7"
              strokeLinecap="round"
              className="motion-safe:animate-[dash-flow_1.2s_linear_infinite]"
            />
            <circle cx="262" cy="136" r="26" fill="var(--color-leash)" opacity="0.15" />
          </svg>
          <div className="absolute top-[52%] left-[65.5%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <span className="flex size-10 items-center justify-center rounded-full border-2 border-surface bg-leash text-surface shadow-cta">
              <Home className="size-5" />
            </span>
            <span className="mt-1 rounded-full bg-surface px-2 py-1 text-label font-semibold shadow-card">Home</span>
          </div>
          <div className="absolute top-[67.5%] left-[28%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <span className="pulse-dot flex size-10 items-center justify-center rounded-full border-2 border-surface bg-trail text-trail">
              <Footprints className="relative z-10 size-5 text-surface" />
            </span>
            <span className="mt-1 rounded-full bg-surface px-2 py-1 text-label font-semibold shadow-card">Your carer</span>
          </div>
        </div>
      </div>

      <div className="absolute -right-2 -bottom-6 w-60 rounded-card border border-hairline bg-surface p-4 shadow-float motion-safe:animate-[float-y_6s_ease-in-out_infinite] sm:-right-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky px-3 py-1 text-label font-semibold text-leash-dark">
            <span className="pulse-dot size-1.5 rounded-full bg-current" />
            On the way
          </span>
          <span className="text-small text-ink-muted">6 min away</span>
        </div>
        <p className="mt-2 text-sm font-semibold">Pet walking, 5:00 – 6:00 pm</p>
        <p className="mt-1 flex items-center gap-1 text-small text-trail">
          <ShieldCheck className="size-3.5" />
          ID and selfie verified
        </p>
      </div>

      <div className="absolute -top-5 -left-2 flex items-center gap-2 rounded-full border border-hairline bg-surface py-2 pr-4 pl-2 shadow-float motion-safe:animate-[float-y_7s_ease-in-out_1s_infinite] sm:-left-6">
        <span className="flex size-8 items-center justify-center rounded-full bg-trail-soft text-trail">
          <Camera className="size-4" />
        </span>
        <span className="text-small font-semibold">New photo update</span>
      </div>
    </div>
  );
}
