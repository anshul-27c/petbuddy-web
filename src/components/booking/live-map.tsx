import { firstName } from "@/lib/labels";
import type { Booking } from "@/lib/types";

const WIDTH = 400;
const HEIGHT = 240;
const METRES_PER_DEGREE = 111_320;
const GRID_STEPS = [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];

/** Metres east and north of the home pin. */
function offsetMetres(home: { lat: number; lng: number }, point: { lat: number; lng: number }) {
  const east = (point.lng - home.lng) * METRES_PER_DEGREE * Math.cos((home.lat * Math.PI) / 180);
  const north = (point.lat - home.lat) * METRES_PER_DEGREE;
  return { east, north };
}

function formatStep(metres: number) {
  return metres >= 1000 ? `${metres / 1000} km` : `${metres} m`;
}

function formatGap(metres: number) {
  return metres >= 1000 ? `${(metres / 1000).toFixed(1)} km` : `${Math.max(10, Math.round(metres / 10) * 10)} m`;
}

/**
 * A schematic map: home in the middle, the carer placed by their live
 * position, on a grid whose squares are labelled with their real size.
 * No map provider or key is needed.
 */
export function LiveMap({ booking }: { booking: Booking }) {
  const home = { lat: booking.address.lat, lng: booking.address.lng };
  const hasFix = booking.earnerLat !== null && booking.earnerLng !== null;
  const carer = hasFix ? offsetMetres(home, { lat: booking.earnerLat!, lng: booking.earnerLng! }) : null;
  const distance = carer ? Math.hypot(carer.east, carer.north) : null;

  // Fit both pins with some margin; never zoom in closer than 300 m across.
  const halfWidth = Math.max(300, carer ? Math.max(Math.abs(carer.east), Math.abs(carer.north) * (WIDTH / HEIGHT)) * 1.35 : 300);
  const scale = WIDTH / 2 / halfWidth; // px per metre
  const step = GRID_STEPS.find((metres) => metres * scale >= 36) ?? GRID_STEPS[GRID_STEPS.length - 1];
  const stepPx = step * scale;

  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  const carerX = carer ? cx + carer.east * scale : null;
  const carerY = carer ? cy - carer.north * scale : null;

  const lines: number[] = [];
  for (let offset = stepPx; offset < WIDTH; offset += stepPx) lines.push(offset);

  const who = firstName(booking.earner.name);
  const label = hasFix
    ? `Map: ${who} is about ${formatGap(distance!)} from ${booking.address.label}.`
    : `Map: waiting for ${who}'s location. ${booking.address.label} is in the middle.`;

  return (
    <figure className="overflow-hidden rounded-field border border-hairline bg-sky">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label} className="block h-auto w-full">
        {lines.map((offset) => (
          <g key={offset} stroke="var(--color-hairline)" strokeWidth="1">
            <line x1={cx + offset} x2={cx + offset} y1={0} y2={HEIGHT} />
            <line x1={cx - offset} x2={cx - offset} y1={0} y2={HEIGHT} />
            <line y1={cy + offset} y2={cy + offset} x1={0} x2={WIDTH} />
            <line y1={cy - offset} y2={cy - offset} x1={0} x2={WIDTH} />
          </g>
        ))}
        <line x1={cx} x2={cx} y1={0} y2={HEIGHT} stroke="var(--color-hairline)" strokeWidth="1" />
        <line y1={cy} y2={cy} x1={0} x2={WIDTH} stroke="var(--color-hairline)" strokeWidth="1" />

        {carerX !== null && carerY !== null ? (
          <line
            x1={cx}
            y1={cy}
            x2={carerX}
            y2={carerY}
            stroke="var(--color-leash)"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
        ) : null}

        <g transform={`translate(${cx} ${cy})`}>
          <circle r="22" fill="var(--color-leash)" opacity="0.14" />
          <circle r="12" fill="var(--color-leash)" stroke="var(--color-surface)" strokeWidth="3" />
          <path d="M-5 1 L0 -4 L5 1 M-3.5 0 V4.5 H3.5 V0" fill="none" stroke="var(--color-surface)" strokeWidth="1.6" strokeLinejoin="round" />
        </g>

        {carerX !== null && carerY !== null ? (
          <g transform={`translate(${carerX} ${carerY})`}>
            <circle r="20" fill="var(--color-trail)" opacity="0.16">
              <animate attributeName="r" values="14;22;14" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle r="11" fill="var(--color-trail)" stroke="var(--color-surface)" strokeWidth="3" />
          </g>
        ) : null}
      </svg>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline bg-surface px-4 py-3 text-small text-ink-muted">
        <span className="inline-flex items-center gap-4">
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-leash" aria-hidden />
            {booking.address.label}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-trail" aria-hidden />
            {who}
          </span>
        </span>
        <span>
          {hasFix ? `About ${formatGap(distance!)} apart · ` : "Waiting for location · "}
          squares are {formatStep(step)}
        </span>
      </figcaption>
    </figure>
  );
}
