import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Shown while a lazy route chunk is downloading, so the navbar and footer never disappear during
 * navigation.
 */
export function RouteFallback() {
  return (
    <div className="container-page space-y-6 py-16" aria-busy="true">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="aspect-4/5 w-full" />
        ))}
      </div>
    </div>
  );
}
