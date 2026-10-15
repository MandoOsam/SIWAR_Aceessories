import type { SVGProps } from "react";

/**
 * TikTok glyph — Lucide ships no brand icon for it (08-owner-ui-revisions.md §R3.a), so it lives
 * here as a local inline SVG. Drawn in the same 24px / 2px-stroke style as Lucide so it sits
 * consistently beside the Facebook and Instagram icons. `currentColor` keeps it theme-aware.
 */
export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M21 7.917v4.034a9.948 9.948 0 0 1-5-1.951v4.5a6.5 6.5 0 1 1-8-6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083A6.005 6.005 0 0 0 21 7.917Z" />
    </svg>
  );
}

export default TikTokIcon;
