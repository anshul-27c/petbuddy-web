import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "accent" | "tonal" | "outline" | "ghost" | "danger";
export type ButtonSize = "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-leash text-surface hover:bg-leash-dark active:bg-leash-dark",
  // Money moments only: "Book and pay", "Place order", "Pay". Set large and bold
  // so white on the accent meets the large-text contrast ratio.
  accent: "bg-tail text-surface hover:brightness-95 active:brightness-90",
  tonal: "bg-sky text-leash-dark hover:bg-leash/15 active:bg-leash/20",
  outline: "border border-hairline bg-surface text-ink hover:bg-canvas active:bg-hairline/60",
  ghost: "text-leash-dark hover:bg-sky active:bg-sky",
  danger: "bg-alert text-surface hover:brightness-95 active:brightness-90",
};

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 px-4",
  lg: "min-h-12 px-5",
};

function textSize(variant: ButtonVariant, size: ButtonSize) {
  if (variant === "accent") return "text-[1.1875rem] font-bold";
  return size === "lg" ? "text-body font-semibold" : "text-sm font-semibold";
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  block = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
} = {}) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-field text-center transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    textSize(variant, size),
    block && "w-full",
    className,
  );
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant,
  size,
  block,
  loading = false,
  icon,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, block, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  icon?: ReactNode;
}

export function ButtonLink({
  variant,
  size,
  block,
  icon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, block, className })} {...rest}>
      {icon}
      {children}
    </Link>
  );
}

interface IconButtonProps extends ComponentProps<"button"> {
  label: string;
  tone?: "plain" | "tonal";
}

/** A 44 px round button that always carries an accessible name. */
export function IconButton({ label, tone = "plain", className, children, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50",
        tone === "tonal" ? "bg-sky text-leash-dark hover:bg-leash/15" : "text-ink hover:bg-canvas",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
