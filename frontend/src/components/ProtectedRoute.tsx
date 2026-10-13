import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { RouteFallback } from "@/components/ui/RouteFallback";
import { useAuthStore } from "@/store/auth";
import { loginRedirectPath } from "@/utils/redirect";

type ProtectedRouteProps = {
  children: ReactNode;
};

/**
 * Client-side guard for the account area (03-code-standards.md §6: handle 401 by returning to login).
 *
 * While the session is still being restored it shows the route skeleton rather than bouncing a
 * just-refreshed customer to the login page. Authorization is only a UX gate — the API enforces
 * ownership on every account endpoint (02-architecture.md §5).
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const status = useAuthStore((state) => state.status);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (status === "idle" || status === "loading") {
    return <RouteFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to={loginRedirectPath(`${location.pathname}${location.search}`)} replace />;
  }

  return <>{children}</>;
}
