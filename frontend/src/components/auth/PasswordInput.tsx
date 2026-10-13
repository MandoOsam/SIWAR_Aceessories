import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";

import { CONTROL_CLASSES, Field } from "@/components/checkout/fields";
import { getPasswordStrength } from "@/utils/password";
import type { PasswordStrength } from "@/services/types";
import { cn } from "@/utils/cn";

type PasswordInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  autoComplete?: string;
  /** Renders the three-segment strength meter (register / reset only). */
  showStrength?: boolean;
};

const FILLED_BARS: Record<PasswordStrength, number> = { weak: 1, medium: 2, strong: 3 };

/** Password field with a show/hide toggle and an optional strength meter (05-ui-context.md §7.11). */
export function PasswordInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  autoComplete = "current-password",
  showStrength = false,
}: PasswordInputProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  const strength = getPasswordStrength(value);
  const filled = FILLED_BARS[strength];

  return (
    <Field id={id} label={label} error={error} hint={hint}>
      {({ describedBy, invalid }) => (
        <>
          <div className="relative">
            <input
              id={id}
              name={id}
              type={visible ? "text" : "password"}
              autoComplete={autoComplete}
              dir="ltr"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onBlur={onBlur}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={cn(CONTROL_CLASSES, "pe-12")}
            />
            <button
              type="button"
              onClick={() => setVisible((current) => !current)}
              aria-label={visible ? t("auth.password.hide") : t("auth.password.show")}
              aria-pressed={visible}
              className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-fg-muted transition-colors duration-500 ease-smooth hover:text-accent"
            >
              {visible ? (
                <EyeOff aria-hidden="true" className="size-5" />
              ) : (
                <Eye aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>

          {showStrength && value !== "" ? (
            <div className="space-y-1.5 pt-1">
              <div className="flex gap-1" aria-hidden="true">
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className={cn(
                      "h-1 flex-1 rounded-pill",
                      index < filled
                        ? strength === "strong"
                          ? "bg-accent"
                          : "bg-accent-2"
                        : "bg-line",
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-fg-muted" aria-live="polite">
                {t("auth.password.strengthLabel")}:{" "}
                <span className="text-fg">{t(`auth.password.${strength}`)}</span>
              </p>
            </div>
          ) : null}
        </>
      )}
    </Field>
  );
}
