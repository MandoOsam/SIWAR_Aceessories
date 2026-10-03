import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-control font-body text-sm font-medium " +
  "uppercase tracking-[0.14em] transition-all duration-500 ease-smooth " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const VARIANT_CLASSES: Record<Variant, string> = {
  // Gold fill with a slow sweep on hover (05 section 4.3).
  primary:
    "relative overflow-hidden bg-accent text-on-accent hover:bg-transparent " +
    "hover:text-accent ring-1 ring-inset ring-accent",
  secondary: "border border-line bg-transparent text-fg hover:border-accent hover:text-accent",
  ghost: "text-fg-muted hover:text-accent",
};

const SIZE_CLASSES: Record<Size, string> = {
  // Touch targets stay at or above 44px (05 section 5.3).
  sm: "min-h-11 px-4",
  md: "min-h-11 px-6",
  lg: "min-h-13 px-8 text-base",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

/** Primary action. Use `type="button"` unless it really submits a form. */
export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = {
  to: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

/** Same visual language as `Button`, but renders a router link. */
export function ButtonLink({
  to,
  variant = "primary",
  size = "md",
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
    >
      {children}
    </Link>
  );
}
