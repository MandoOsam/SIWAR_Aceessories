import { cn } from "@/utils/cn";

type SkeletonProps = {
  className?: string;
};

/** Loading placeholder. Every list and page in this app shows one while data is in flight. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div aria-hidden="true" className={cn("animate-pulse rounded-card bg-surface-2", className)} />
  );
}

type SkeletonTextProps = {
  lines?: number;
  className?: string;
};

/** A block of text-shaped skeleton lines. */
export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={cn("h-3", index === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}
