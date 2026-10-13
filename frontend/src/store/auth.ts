/**
 * Auth client state — the signed-in customer for the current tab session.
 *
 * The session itself is owned by the server (httpOnly cookie, 02-architecture.md §5); this store
 * only caches the profile returned by `GET /auth/me` so the navbar and `ProtectedRoute` agree
 * without each fetching. Nothing personal is persisted here — `hydrate` rebuilds the state from the
 * service on every boot (D-046).
 */

import { create } from "zustand";

import { getCurrentUser } from "@/services/authService";
import type { AuthUser } from "@/services/types";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  /** Reads the current session from the service; called once per boot. */
  hydrate: () => Promise<void>;
  /** Records a freshly logged-in / registered user. */
  setUser: (user: AuthUser) => void;
  /** Clears the local user (after logout). */
  clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  isAuthenticated: false,

  setUser: (user) => set({ user, status: "authenticated", isAuthenticated: true }),

  clearUser: () => set({ user: null, status: "unauthenticated", isAuthenticated: false }),

  hydrate: async () => {
    set({ status: "loading" });
    try {
      const user = await getCurrentUser();
      if (user !== null) {
        set({ user, status: "authenticated", isAuthenticated: true });
      } else {
        set({ user: null, status: "unauthenticated", isAuthenticated: false });
      }
    } catch {
      set({ user: null, status: "unauthenticated", isAuthenticated: false });
    }
  },
}));
