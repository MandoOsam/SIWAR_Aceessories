import { useEffect } from "react";

import { useAuthStore } from "@/store/auth";

/**
 * Restores the session once when the app mounts, so a refresh keeps the customer signed in.
 *
 * Runs in the provider layer (not in a page) because the navbar and `ProtectedRoute` need the
 * answer on first render.
 */
export function useAuthBootstrap(): void {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);
}
