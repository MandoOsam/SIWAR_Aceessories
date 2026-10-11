import { cn } from "@/utils/cn";

export interface PriceInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onCommit: () => void;
  label: string;
  placeholder: string;
}

/** Native `number` bound for the price range; committed on blur/Enter, never on every keystroke. */
export function PriceInput({
  value,
  onValueChange,
  onCommit,
  label,
  placeholder,
}: PriceInputProps) {
  return (
    <label className="flex-1">
      <span className="sr-only">{label}</span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onBlur={onCommit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onCommit();
          }
        }}
        placeholder={placeholder}
        aria-label={label}
        className={cn(
          "w-full rounded-control border border-line bg-surface px-3 py-2 text-sm text-fg",
          "placeholder:text-fg-muted transition-colors duration-500 ease-smooth focus:border-accent",
        )}
      />
    </label>
  );
}