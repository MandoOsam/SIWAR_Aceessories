import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";

export interface CategoryTileProps {
  title: string;
  imageUrl: string;
  href: string;
  alt?: string;
  className?: string;
}

export function CategoryTile({ title, imageUrl, href, alt, className }: CategoryTileProps) {
  return (
    <Link
      to={href}
      className={cn(
        "group relative flex aspect-square items-center justify-center overflow-hidden rounded-card bg-surface-2 transition-transform duration-500 ease-smooth hover:scale-[1.02]",
        className,
      )}
    >
      <img
        src={imageUrl}
        alt={alt ?? title}
        loading="lazy"
        className="absolute inset-0 size-full object-cover object-center transition-transform duration-700 ease-smooth group-hover:scale-110"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/40 transition-opacity duration-500 ease-smooth group-hover:bg-black/30" />
      <div className="relative z-10 px-4 text-center">
        <span className="font-heading text-heading-sm text-on-hero drop-shadow-sm">{title}</span>
      </div>
    </Link>
  );
}

export default CategoryTile;
