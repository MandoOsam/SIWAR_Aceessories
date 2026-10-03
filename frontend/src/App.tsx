import { Suspense } from "react";

import { AppProviders } from "@/app/AppProviders";
import { AppRoutes } from "@/app/AppRoutes";
import { RouteFallback } from "@/components/ui/RouteFallback";

export function App() {
  return (
    <AppProviders>
      <Suspense fallback={<RouteFallback />}>
        <AppRoutes />
      </Suspense>
    </AppProviders>
  );
}
