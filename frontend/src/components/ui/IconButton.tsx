import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";

const BASE_CLASSES =
  "inline-flex size-11 items-center justify-center rounded-control text-current " +
  "transition-colors duration-500 ease-smooth hover:text-accent";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Required: an icon-only control needs an accessible name (03-code-standards.md §5). */
  label: string;
  icon: ReactNode;
};

export function IconButton({ label, icon, className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(BASE_CLASSES, className)}
      {...rest}
    >
      {icon}
    </button>
  );
}

type IconLinkProps = {
  to: string;
  label: string;
  icon: ReactNode;
  className?: string;
};

/** Same visual language as `IconButton`, but navigates. */
export function IconLink({ to, label, icon, className }: IconLinkProps) {
  return (
    <Link to={to} aria-label={label} title={label} className={cn(BASE_CLASSES, className)}>
      {icon}
    </Link>
  );
}
