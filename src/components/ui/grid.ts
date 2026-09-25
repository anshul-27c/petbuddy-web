/**
 * Helpers that keep grids free of half-empty last rows at every breakpoint.
 * Tailwind only ships classes it can see, so every class is spelled out here.
 */

export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl";

const COL_SPAN: Record<Breakpoint, Record<number, string>> = {
  base: { 1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4" },
  sm: { 1: "sm:col-span-1", 2: "sm:col-span-2", 3: "sm:col-span-3", 4: "sm:col-span-4" },
  md: { 1: "md:col-span-1", 2: "md:col-span-2", 3: "md:col-span-3", 4: "md:col-span-4" },
  lg: { 1: "lg:col-span-1", 2: "lg:col-span-2", 3: "lg:col-span-3", 4: "lg:col-span-4" },
  xl: { 1: "xl:col-span-1", 2: "xl:col-span-2", 3: "xl:col-span-3", 4: "xl:col-span-4" },
};

const GRID_COLS: Record<Breakpoint, Record<number, string>> = {
  base: { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" },
  sm: { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" },
  md: { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" },
  lg: { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" },
  xl: { 1: "xl:grid-cols-1", 2: "xl:grid-cols-2", 3: "xl:grid-cols-3", 4: "xl:grid-cols-4" },
};

// Grid items are flex columns so their cards stretch to the row height.
const VISIBLE: Record<Breakpoint, [shown: string, hidden: string]> = {
  base: ["flex", "hidden"],
  sm: ["sm:flex", "sm:hidden"],
  md: ["md:flex", "md:hidden"],
  lg: ["lg:flex", "lg:hidden"],
  xl: ["xl:flex", "xl:hidden"],
};

type Columns = Partial<Record<Breakpoint, number>>;

/**
 * A bento where the first tile is the feature: at each breakpoint it spans
 * just enough columns for `count` tiles to finish on a full row.
 */
export function bentoLayout(count: number, columns: Columns) {
  const featureSpan = (Object.entries(columns) as [Breakpoint, number][])
    .map(([breakpoint, cols]) => {
      let span = 1;
      for (let candidate = Math.min(cols, 2); candidate <= cols; candidate += 1) {
        if ((count - 1 + candidate) % cols === 0) {
          span = candidate;
          break;
        }
      }
      if (span === 1 && (count - 1 + 1) % cols !== 0) span = Math.min(2, cols);
      return COL_SPAN[breakpoint][span];
    })
    .join(" ");
  const grid = (Object.entries(columns) as [Breakpoint, number][])
    .map(([breakpoint, cols]) => GRID_COLS[breakpoint][cols])
    .join(" ");
  return { grid, featureSpan };
}

/**
 * For a teaser grid: at each breakpoint show only as many items as fill whole
 * rows (fewer items than columns shrink the column count instead).
 */
export function fullRows(count: number, columns: Columns) {
  const entries = Object.entries(columns) as [Breakpoint, number][];
  const grid = entries.map(([breakpoint, cols]) => GRID_COLS[breakpoint][Math.max(1, Math.min(cols, count))]).join(" ");
  const item = (index: number) =>
    entries
      .map(([breakpoint, cols]) => {
        const shown = count <= cols ? count : Math.floor(count / cols) * cols;
        return VISIBLE[breakpoint][index < shown ? 0 : 1];
      })
      .join(" ");
  return { grid, item };
}
