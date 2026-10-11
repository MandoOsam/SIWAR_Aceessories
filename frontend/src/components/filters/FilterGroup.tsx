import type { ReactNode } from "react";

export interface FilterGroupProps {
  title: string;
  children: ReactNode;
}

/** Fieldset wrapper used by every group inside `FilterPanel` (03-code-standards.md §5). */
export function FilterGroup({ title, children }: FilterGroupProps) {
  return (
    <fieldset className="border-t border-line pt-5 first:border-t-0 first:pt-0">
      <legend className="mb-4 font-heading text-xs uppercase tracking-[0.24em] text-fg-muted">
        {title}
      </legend>
      <div className="flex flex-col gap-1">{children}</div>
    </fieldset>
  );
}