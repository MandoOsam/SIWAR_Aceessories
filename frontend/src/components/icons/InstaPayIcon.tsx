import type { SVGProps } from "react";

/**
 * InstaPay mark (08-owner-ui-revisions.md §R3.c): a payment card with a lightning bolt — the
 * "instant transfer" motif. Simple-icons has no InstaPay entry, so it is drawn locally with
 * `currentColor`. The method name always sits beside it, so this is a supporting glyph, not the
 * only identifier.
 */
export function InstaPayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="2.75" y="5.25" width="18.5" height="13.5" rx="2.75" />
      <path d="M13.2 8.4 9.6 13h2.6l-.9 2.8 3.7-4.8h-2.6l.8-2.6Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default InstaPayIcon;
