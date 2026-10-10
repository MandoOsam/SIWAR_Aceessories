import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/utils/cn";

/** Last-resort poster if the owner's real file is missing, so the hero never flashes an empty box. */
const PLACEHOLDER_POSTER = "/assets/placeholder/hero-poster.svg";

type HeroBackgroundProps = {
  /** Path to the hero video, e.g. `/assets/hero/hero.mp4`. */
  videoSrc: string;
  /** Poster shown first-paint and used when motion is reduced. */
  posterSrc: string;
  /** 0–1 opacity of the dark overlay that keeps the hero copy readable. */
  overlayOpacity?: number;
  className?: string;
};

/**
 * Animated hero background with a poster-first, lazy video.
 *
 * The poster paints immediately (eager) so it can act as the LCP candidate. The video is only
 * mounted after the first paint, so it never blocks the initial render. When the visitor prefers
 * reduced motion, or the video cannot be played, we keep the poster and never mount the video
 * (05-ui-context.md §5.4).
 */
export function HeroBackground({
  videoSrc,
  posterSrc,
  overlayOpacity = 0.55,
  className,
}: HeroBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isReady, setIsReady] = useState(false);
  const [didVideoFail, setDidVideoFail] = useState(false);
  const [resolvedPoster, setResolvedPoster] = useState(posterSrc);

  useEffect(() => {
    if (shouldReduceMotion === true) {
      return;
    }
    const timer = window.setTimeout(() => setIsReady(true), 200);
    return () => window.clearTimeout(timer);
  }, [shouldReduceMotion]);

  const showVideo = isReady && shouldReduceMotion !== true && !didVideoFail;

  return (
    <div aria-hidden="true" className={cn("absolute inset-0 -z-10 overflow-hidden", className)}>
      <img
        src={resolvedPoster}
        alt=""
        width={1920}
        height={1080}
        loading="eager"
        decoding="async"
        onError={() => setResolvedPoster(PLACEHOLDER_POSTER)}
        className="absolute inset-0 size-full object-cover"
      />
      {showVideo ? (
        <video
          src={videoSrc}
          poster={resolvedPoster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setDidVideoFail(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
    </div>
  );
}

export default HeroBackground;
