import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

export interface PillButtonProps {
  selected: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}

/** Single-select pill (rating, colour, ring size) with `aria-pressed` state. */
export function PillButton({ selected, label, onClick, children }: PillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-control border px-4 text-sm",
        "transition-colors duration-500 ease-smooth",
        selected
          ? "border-accent bg-accent text-on-accent"
          : "border-line text-fg hover:border-accent hover:text-accent",
      )}
    >
      {children}
    </button>
  );
}