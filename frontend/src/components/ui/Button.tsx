import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const BASE_CLASSES =
  "group inline-flex items-center justify-center gap-2 rounded-control font-body text-sm font-medium " +
  "uppercase tracking-[0.14em] transition-all duration-500 ease-smooth " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const VARIANT_CLASSES: Record<Variant, string> = {
  // Gold fill with a slow fill-sweep hover animation (05 section 4.3)
  primary:
    "relative overflow-hidden bg-accent text-on-accent ring-1 ring-inset ring-accent " +
    "before:absolute before:inset-0 before:-z-10 before:bg-bg before:origin-left before:scale-x-0 " +
    "before:transition-transform before:duration-500 before:ease-smooth " +
    "hover:text-accent hover:before:scale-x-100 rtl:before:origin-right",
  secondary:
    "relative overflow-hidden border border-line bg-transparent text-fg " +
    "before:absolute before:inset-0 before:-z-10 before:bg-accent before:origin-left before:scale-x-0 " +
    "before:transition-transform before:duration-500 before:ease-smooth " +
    "hover:border-accent hover:text-on-accent hover:before:scale-x-100 rtl:before:origin-right",
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
