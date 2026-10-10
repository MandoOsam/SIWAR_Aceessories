import { Component, lazy, Suspense, useState } from "react";
import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/utils/cn";

const Hero3DScene = lazy(() => import("./Hero3DScene"));

/**
 * Detects a usable WebGL context before mounting three.js, so devices/browsers without WebGL get
 * the static image instead of a thrown error.
 */
function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function StaticHeroImage({ src, className }: { src: string; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={600}
      height={600}
      loading="lazy"
      decoding="async"
      className={cn("size-full object-contain", className)}
    />
  );
}

type ErrorBoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

/**
 * If the 3D chunk fails to load or the WebGL context throws, we quietly fall back to a static
 * image instead of taking the whole hero down (the feature stays, it just degrades).
 */
class Hero3DErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error): void {
    console.error("Hero3D failed to render, using static fallback.", error);
  }

  override render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

type Hero3DProps = {
  /** Static image shown while the chunk loads and if rendering fails. */
  fallbackImage: string;
  className?: string;
};

export function Hero3D({ fallbackImage, className }: Hero3DProps) {
  const shouldReduceMotion = useReducedMotion();
  const reducedMotion = shouldReduceMotion === true;
  const [webglAvailable] = useState(supportsWebGL);

  if (!webglAvailable) {
    return <StaticHeroImage src={fallbackImage} className={className} />;
  }

  const fallback = <StaticHeroImage src={fallbackImage} className={className} />;

  return (
    <Hero3DErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <div aria-hidden="true" className={cn("pointer-events-none size-full", className)}>
          <Hero3DScene reducedMotion={reducedMotion} />
        </div>
      </Suspense>
    </Hero3DErrorBoundary>
  );
}

export default Hero3D;
