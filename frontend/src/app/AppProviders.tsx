import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";

import i18n from "@/i18n";
import { useSyncPreferences } from "@/hooks/useSyncPreferences";

type AppProvidersProps = {
  children: ReactNode;
};

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Catalogue content does not change between navigations, so it stays fresh for a while.
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

/** Bridges the preferences store to i18next and to the `<html>` element. */
function PreferencesBridge() {
  useSyncPreferences();
  return null;
}

export function AppProviders({ children }: AppProvidersProps) {
  // Created once per mount so a re-render never throws away the cache.
  const [queryClient] = useState(createQueryClient);

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <PreferencesBridge />
        {children}
      </QueryClientProvider>
    </I18nextProvider>
  );
}
