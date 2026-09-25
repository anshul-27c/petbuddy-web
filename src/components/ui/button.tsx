import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "tonal"
  | "outline"
  | "ghost"
  | "danger"
  | "danger-quiet"
  | "danger-outline"
  | "light";
export type ButtonSize = "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-leash text-surface shadow-cta hover:bg-leash-dark active:bg-leash-dark",
  // Money moments only: "Book and pay", "Place order", "Pay". Set large and bold
  // so white on the accent meets the large-text contrast ratio.
  accent: "bg-tail text-surface shadow-cta-accent hover:brightness-95 active:brightness-90",
  tonal: "bg-sky text-leash-dark hover:bg-leash-tint active:bg-leash-tint",
  outline: "border border-hairline bg-surface text-ink shadow-card hover:border-ink-faint hover:bg-mist active:bg-canvas",
  ghost: "text-leash-dark hover:bg-sky active:bg-sky",
  danger: "bg-alert text-surface hover:brightness-95 active:brightness-90",
  // Destructive, but not the main action: "Remove" on a card, "Delete my account".
  "danger-quiet": "text-alert hover:bg-alert-soft active:bg-alert-soft",
  "danger-outline": "border border-hairline bg-surface text-alert shadow-card hover:border-alert hover:bg-alert-soft",
  // White on the dark bands.
  light: "bg-surface text-ink shadow-float hover:bg-sky active:bg-sky",
};

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 px-4",
  lg: "min-h-12 px-6",
};

function textSize(variant: ButtonVariant, size: ButtonSize) {
  if (variant === "accent") return "text-[1.1875rem] font-bold";
  return size === "lg" ? "text-body font-semibold" : "text-sm font-semibold";
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  block = false,
  sheen = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  /** A sweep of light: for the one main call to action on a screen. */
  sheen?: boolean;
  className?: string;
} = {}) {
  return cn(
    "relative inline-flex select-none items-center justify-center gap-2 rounded-field text-center",
    "transition duration-150 ease-out active:scale-98",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    textSize(variant, size),
    block && "w-full",
    sheen && "sheen",
    className,
  );
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  sheen?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

/** While loading, the label stays in place (invisible) under the spinner, so the button keeps its width. */
export function Button({
  variant,
  size,
  block,
  sheen,
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
      className={buttonClasses({ variant, size, block, sheen, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <span className={cn("inline-flex items-center justify-center gap-2", loading && "invisible")}>
        {icon}
        {children}
      </span>
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <LoaderCircle className="size-5 animate-spin" />
        </span>
      ) : null}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  sheen?: boolean;
  icon?: ReactNode;
}

export function ButtonLink({ variant, size, block, sheen, icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, block, sheen, className })} {...rest}>
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
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full transition duration-150 active:scale-95 disabled:opacity-50",
        tone === "tonal" ? "bg-sky text-leash-dark hover:bg-leash-tint" : "text-ink hover:bg-canvas",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
