import {
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@/components/ui/IconButton";
import { useLocale } from "@/hooks/useLocale";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { L10n, ProductImage } from "@/services/types";
import { cn } from "@/utils/cn";
import { localize } from "@/utils/format";

export interface ProductGalleryProps {
  images: ProductImage[];
  /** Fallback alt text when an image's own `alt` is empty. */
  productName: L10n;
  className?: string;
}

const SWIPE_THRESHOLD_PX = 40;
const ZOOM_SCALE = 1.8;

/**
 * Product image gallery (05-ui-context.md §7.5): main image plus a thumbnail strip, click and
 * keyboard navigation, desktop hover-zoom, mobile swipe, and RTL-safe arrow mirroring.
 *
 * Handles 0, 1 and many images. Zoom is a hover affordance, so it is disabled for coarse pointers
 * and for `prefers-reduced-motion` (03-code-standards.md §5).
 */
export function ProductGallery({ images, productName, className }: ProductGalleryProps) {
  const { t } = useTranslation();
  const { locale, isRtl } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number } | null>(null);
  const pointerStartX = useRef<number | null>(null);

  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");

  const count = images.length;
  const safeIndex = count === 0 ? 0 : Math.min(activeIndex, count - 1);
  const activeImage = images[safeIndex];
  const hasMultiple = count > 1;
  const zoomEnabled = canHover && !prefersReducedMotion;

  const goTo = (index: number): void => {
    if (count === 0) return;
    setActiveIndex(((index % count) + count) % count);
    setZoomOrigin(null);
  };
  const goPrevious = (): void => goTo(safeIndex - 1);
  const goNext = (): void => goTo(safeIndex + 1);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (isRtl) goNext();
      else goPrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      if (isRtl) goPrevious();
      else goNext();
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!hasMultiple) return;
    pointerStartX.current = event.clientX;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const start = pointerStartX.current;
    pointerStartX.current = null;
    if (start === null) return;

    const delta = event.clientX - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;

    const movedLeft = delta < 0;
    // In Arabic the strip reads the other way, so the same swipe advances in the opposite index.
    const advance = isRtl ? !movedLeft : movedLeft;
    if (advance) goNext();
    else goPrevious();
  };

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>): void => {
    if (!zoomEnabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    setZoomOrigin({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  if (activeImage === undefined) {
    return (
      <div
        className={cn(
          "flex aspect-[4/5] w-full items-center justify-center rounded-card border border-line bg-surface-2 text-sm text-fg-muted",
          className,
        )}
      >
        {t("product.gallery.noImage")}
      </div>
    );
  }

  const activeAlt = localize(activeImage.alt, locale).trim();
  const altText = activeAlt === "" ? localize(productName, locale) : activeAlt;
  const PreviousIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        role="region"
        aria-label={t("product.gallery.label")}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoomOrigin(null)}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-card border border-line bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <img
          src={activeImage.url}
          alt={altText}
          width={800}
          height={1000}
          loading="lazy"
          decoding="async"
          draggable={false}
          className={cn(
            "absolute inset-0 size-full object-cover object-center",
            zoomEnabled && "transition-transform duration-500 ease-smooth",
          )}
          style={
            zoomOrigin === null
              ? undefined
              : {
                  transform: `scale(${ZOOM_SCALE})`,
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                }
          }
        />

        {hasMultiple && (
          <>
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2">
              <IconButton
                onClick={goPrevious}
                label={t("product.gallery.previous")}
                className="pointer-events-auto bg-surface/80 text-fg backdrop-blur-sm hover:bg-surface"
                icon={<PreviousIcon className="h-5 w-5" />}
              />
            </div>
            <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-2">
              <IconButton
                onClick={goNext}
                label={t("product.gallery.next")}
                className="pointer-events-auto bg-surface/80 text-fg backdrop-blur-sm hover:bg-surface"
                icon={<NextIcon className="h-5 w-5" />}
              />
            </div>
          </>
        )}
      </div>

      {hasMultiple && (
        <div
          role="group"
          aria-label={t("product.gallery.thumbnails")}
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {images.map((image, index) => {
            const isActive = index === safeIndex;
            return (
              <button
                key={`${image.url}-${String(index)}`}
                type="button"
                onClick={() => goTo(index)}
                aria-label={t("product.gallery.goTo", { index: index + 1, count })}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-control border bg-surface-2",
                  "transition-colors duration-300 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:size-20",
                  isActive ? "border-accent" : "border-line hover:border-fg-muted",
                )}
              >
                <img
                  src={image.url}
                  alt=""
                  width={160}
                  height={200}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className={cn("size-full object-cover object-center", !isActive && "opacity-70")}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
