export interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

/** Label-checkbox row for the boolean filters (availability, discount, new). */
export function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-fg">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 shrink-0 accent-accent"
      />
      <span>{label}</span>
    </label>
  );
}