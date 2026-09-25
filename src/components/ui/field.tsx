"use client";

import { Check, ChevronDown } from "lucide-react";
import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Inputs share one look: 48 px tall, 16 px inset, and a soft leash halo on focus. */
const CONTROL =
  "w-full rounded-field border bg-surface px-4 text-body text-ink shadow-card placeholder:text-ink-muted transition duration-150 ease-out hover:border-ink-faint focus-glow disabled:bg-canvas disabled:text-ink-faint";

function describedBy(id: string, error: string | undefined, hint: ReactNode) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

interface ShellProps {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
  hideLabel?: boolean;
}

function FieldShell({ id, label, hint, error, optional, className, children, hideLabel }: ShellProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className={cn("text-sm font-semibold text-ink", hideLabel && "sr-only")}>
        {label}
        {optional ? <span className="font-normal text-ink-muted"> (optional)</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-small font-medium text-alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-small text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends Omit<ComponentProps<"input">, "id"> {
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  /** Fixed text inside the field's left edge, such as "+91". */
  leading?: ReactNode;
  /** Marks the field invalid when the message is shown elsewhere (a group error). */
  invalid?: boolean;
  hideLabel?: boolean;
  containerClassName?: string;
}

export function TextField({
  label,
  hint,
  error,
  optional,
  leading,
  invalid,
  hideLabel,
  containerClassName,
  className,
  ...rest
}: TextFieldProps) {
  const id = useId();
  const input = (
    <input
      id={id}
      aria-invalid={error || invalid ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={cn(
        CONTROL,
        "h-12",
        error || invalid ? "border-alert" : "border-hairline",
        leading ? "pl-18" : "",
        className,
      )}
      {...rest}
    />
  );
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      hideLabel={hideLabel}
      className={containerClassName}
    >
      {leading ? (
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-14 items-center justify-center border-r border-hairline text-body font-semibold text-ink-muted">
            {leading}
          </span>
          {input}
        </div>
      ) : (
        input
      )}
    </FieldShell>
  );
}

interface TextAreaProps extends Omit<ComponentProps<"textarea">, "id"> {
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  containerClassName?: string;
}

export function TextArea({ label, hint, error, optional, containerClassName, className, ...rest }: TextAreaProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={containerClassName}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(CONTROL, "min-h-24 py-3", error ? "border-alert" : "border-hairline", className)}
        {...rest}
      />
    </FieldShell>
  );
}

interface SelectFieldProps extends Omit<ComponentProps<"select">, "id"> {
  label: string;
  hint?: ReactNode;
  error?: string;
  hideLabel?: boolean;
  containerClassName?: string;
}

export function SelectField({
  label,
  hint,
  error,
  hideLabel,
  containerClassName,
  className,
  children,
  ...rest
}: SelectFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} hideLabel={hideLabel} className={containerClassName}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          className={cn(
            CONTROL,
            "h-12 appearance-none pr-10",
            error ? "border-alert" : "border-hairline",
            className,
          )}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-muted"
          aria-hidden
        />
      </div>
    </FieldShell>
  );
}

/** An on/off switch built on a checkbox: a pill track and a thumb that springs across. */
export function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-body font-medium text-ink">{label}</span>
        {description ? <span className="mt-1 block text-small text-ink-muted">{description}</span> : null}
      </label>
      <span className="relative inline-flex shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        <span
          aria-hidden
          className="h-7 w-12 rounded-full bg-hairline shadow-[inset_0_1px_2px_rgb(14_32_56/0.12)] transition-colors duration-200 peer-checked:bg-leash peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-leash peer-disabled:opacity-50"
        />
        <span
          aria-hidden
          className="absolute top-1 left-1 size-5 rounded-full bg-surface shadow-float transition-transform duration-300 ease-spring peer-checked:translate-x-5"
        />
      </span>
    </div>
  );
}

/** A group of single-choice cards (radio inputs), used for payment methods and pickers. */
export function ChoiceCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  icon,
  trailing,
  disabled,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex min-h-16 cursor-pointer items-center gap-3 rounded-field border p-4 transition duration-150 ease-out",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-leash",
        checked
          ? "border-leash bg-sky shadow-[inset_0_0_0_1px_var(--color-leash)]"
          : "border-hairline bg-surface shadow-card hover:border-ink-faint",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      {icon ? (
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-field text-leash transition-colors [&_svg]:size-5",
            checked ? "bg-surface" : "bg-sky",
          )}
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-body font-semibold text-ink">{title}</span>
        {description ? <span className="mt-1 block text-small text-ink-muted">{description}</span> : null}
      </span>
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
      <span
        aria-hidden
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150",
          checked ? "border-leash bg-leash" : "border-ink-faint bg-surface",
        )}
      >
        {checked ? <Check className="size-3 animate-pop-in text-surface" strokeWidth={4} /> : null}
      </span>
    </label>
  );
}
