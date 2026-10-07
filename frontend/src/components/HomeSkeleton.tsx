import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export function HomeSkeleton() {
  return (
    <div className="space-y-16 py-12">
      <section className="container-page">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full max-w-3xl" />
          <SkeletonText lines={2} className="max-w-xl" />
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 w-40" />
          </div>
        </div>
      </section>

      <section className="container-page">
        <Skeleton className="h-10 w-48" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square w-full" />
          ))}
        </div>
      </section>

      <section className="container-page">
        <Skeleton className="h-10 w-48" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[4/5] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomeSkeleton;
