"use client";

import { Search, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useDebouncedValue } from "@/lib/hooks";

/**
 * A search input that reports its value after typing pauses. Remount it with a
 * new `key` to reset it from outside (for example when filters are cleared).
 */
export function SearchBox({
  initial,
  onSearch,
  label,
  placeholder,
}: {
  initial: string;
  onSearch: (value: string) => void;
  label: string;
  placeholder: string;
}) {
  const id = useId();
  const [value, setValue] = useState(initial);
  const debounced = useDebouncedValue(value, 350);

  useEffect(() => {
    if (debounced.trim() !== initial.trim()) onSearch(debounced);
    // Only react to what the person typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2 text-ink-muted" aria-hidden />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="focus-glow h-12 w-full rounded-field border border-hairline bg-surface pr-12 pl-12 text-body shadow-card transition duration-150 ease-out placeholder:text-ink-muted hover:border-ink-faint [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            onSearch("");
          }}
          className="absolute top-1/2 right-1 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition duration-150 hover:bg-canvas active:scale-95"
          aria-label="Clear search"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
