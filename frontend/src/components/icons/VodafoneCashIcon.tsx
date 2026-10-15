import type { SVGProps } from "react";

/**
 * Vodafone Cash mark (08-owner-ui-revisions.md §R3.c): the Vodafone speech-mark, filled with
 * `currentColor`. Kept monochrome so it reads cleanly beside the method name in both themes.
 */
export function VodafoneCashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0m4.25 1.12c.32 0 .65.03.86.1-2.17.45-3.9 2.47-3.89 4.78 0 .05 0 .11.01.17 3.64.89 5.27 3.08 5.27 6.11.04 3.03-2.36 6.36-6.41 6.37-3.27.01-6.68-2.79-6.7-7.28-.01-2.97 1.61-5.83 3.65-7.52 2-1.66 4.73-2.72 7.21-2.73" />
    </svg>
  );
}

export default VodafoneCashIcon;
