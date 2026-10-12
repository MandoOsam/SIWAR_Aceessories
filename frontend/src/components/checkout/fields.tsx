import type { ReactNode } from "react";

/** Shared control styling so every checkout input looks identical. */
export const CONTROL_CLASSES =
  "w-full rounded-control border border-line bg-surface px-4 py-2 text-fg " +
  "placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-accent";

type FieldRenderIds = {
  describedBy: string | undefined;
  invalid: boolean;
};

export interface FieldProps {
  /** DOM id shared by the label, the control and the message. */
  id: string;
  label: string;
  error: string | undefined;
  hint?: string;
  /** Shown next to the label, e.g. "optional". */
  optionalLabel?: string;
  children: (ids: FieldRenderIds) => ReactNode;
}

/**
 * Label + control + error/hint, wired with `aria-describedby` and `aria-invalid`. The control is a
 * render prop so `input`, `select` and `textarea` all share the same accessible chrome.
 */
export function Field({ id, label, error, hint, optionalLabel, children }: FieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error !== undefined ? errorId : hint !== undefined ? hintId : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-fg">
        <span>{label}</span>
        {optionalLabel !== undefined ? (
          <span className="text-xs font-normal text-fg-muted">({optionalLabel})</span>
        ) : null}
      </label>
      {children({ describedBy, invalid: error !== undefined })}
      {error !== undefined ? (
        <p id={errorId} role="alert" className="text-sm text-accent-2">
          {error}
        </p>
      ) : hint !== undefined ? (
        <p id={hintId} className="text-xs text-fg-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
