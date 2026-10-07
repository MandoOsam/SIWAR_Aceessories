import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  emphasis?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
  align?: "start" | "center" | "end";
}

export function SectionHeading({
  eyebrow,
  title,
  emphasis,
  subtitle,
  ctaLabel,
  ctaHref,
  className,
  align = "start",
}: SectionHeadingProps) {
  const alignClasses = {
    start: "text-start items-start",
    center: "text-center items-center mx-auto",
    end: "text-end items-end",
  };

  return (
    <div className={cn("flex flex-col gap-4", alignClasses[align], className)}>
      {eyebrow && (
        <span className="font-body text-xs uppercase tracking-[0.3em] text-accent">
          {eyebrow}
        </span>
      )}
      <h2 className="font-heading text-heading leading-tight text-fg">
        {title}
        {emphasis && (
          <>
            {" "}
            <em className="font-heading italic text-accent">{emphasis}</em>
          </>
        )}
      </h2>
      {subtitle && (
        <p className="max-w-2xl text-lead text-fg-muted">{subtitle}</p>
      )}
      {ctaLabel && ctaHref && (
        <Link
          to={ctaHref}
          className="mt-2 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-accent transition-colors hover:text-accent/80"
        >
          {ctaLabel}
          <span aria-hidden="true" className="rtl-flip">
            →
          </span>
        </Link>
      )}
    </div>
  );
}

export default SectionHeading;
