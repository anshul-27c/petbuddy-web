"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;

/**
 * Six single-digit boxes. Typing moves forward, Backspace moves back, and a
 * pasted or autofilled code is spread across the boxes.
 */
export function OtpInput({
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  const focusBox = (index: number) => {
    const box = refs.current[Math.max(0, Math.min(LENGTH - 1, index))];
    box?.focus();
    box?.select();
  };

  const fillFrom = (index: number, incoming: string) => {
    const clean = incoming.replace(/\D/g, "");
    if (!clean) return;
    const next = digits.slice();
    let cursor = index;
    for (const digit of clean) {
      if (cursor >= LENGTH) break;
      next[cursor] = digit;
      cursor += 1;
    }
    onChange(next.join("").slice(0, LENGTH));
    focusBox(cursor >= LENGTH ? LENGTH - 1 : cursor);
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = digits.slice();
      if (next[index]) {
        next[index] = "";
        onChange(next.join(""));
      } else if (index > 0) {
        next[index - 1] = "";
        onChange(next.join(""));
        focusBox(index - 1);
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const onPaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    fillFrom(index, event.clipboardData.getData("text"));
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="Six-digit code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          pattern="[0-9]*"
          maxLength={index === 0 ? LENGTH : 1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${LENGTH}`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          autoFocus={index === 0}
          onFocus={(event) => event.target.select()}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={(event) => onPaste(index, event)}
          onChange={(event) => {
            const typed = event.target.value.replace(/\D/g, "");
            if (!typed) return;
            if (typed.length >= LENGTH) {
              // Autofill or a paste dropped the whole code into one box.
              fillFrom(0, typed);
            } else if (digit && typed.length === 2) {
              // Typed into a filled box: keep the new digit, wherever the caret was.
              fillFrom(index, typed.replace(digit, "") || digit);
            } else {
              fillFrom(index, typed);
            }
          }}
          className={cn(
            "h-14 w-full min-w-0 rounded-field border bg-surface text-center font-display text-headline font-semibold tabular-nums text-ink focus:border-leash focus:outline-2 focus:outline-offset-0 focus:outline-leash/30 disabled:bg-canvas",
            invalid ? "border-alert" : "border-hairline",
          )}
        />
      ))}
    </div>
  );
}
