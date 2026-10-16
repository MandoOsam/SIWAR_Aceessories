import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/utils/cn";

const MiniRingScene = lazy(() => import("./MiniRingScene"));

/**
 * Detects WebGL2/WebGL support before mounting three.js.
 */
function supportsWebGL(): boolean {
  try {
    if (typeof document === "undefined") {
      return false;
    }
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function StaticFallback({ src, className }: { src: string; className?: string }) {
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

class MiniRingErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error): void {
    // Failed to render 3D scene; fallback to static poster below
    void error;
  }

  override render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

type MiniRing3DProps = {
  fallbackImage: string;
  className?: string;
};

export function MiniRing3D({ fallbackImage, className }: MiniRing3DProps) {
  const shouldReduceMotion = useReducedMotion();
  const reducedMotion = shouldReduceMotion === true;
  const [webglAvailable] = useState(supportsWebGL);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const node = containerRef.current;
    if (node === null) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: "50px 0px" },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);

  if (!webglAvailable) {
    return <StaticFallback src={fallbackImage} className={className} />;
  }

  const fallback = <StaticFallback src={fallbackImage} className={className} />;

  return (
    <div ref={containerRef} className={cn("size-full", className)}>
      {!isInView ? (
        fallback
      ) : (
        <MiniRingErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <div aria-hidden="true" className={cn("pointer-events-none size-full")}>
              <MiniRingScene reducedMotion={reducedMotion} />
            </div>
          </Suspense>
        </MiniRingErrorBoundary>
      )}
    </div>
  );
}

export default MiniRing3D;
