import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { searchSuggest } from "@/services/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useEscapeKey, useLockBodyScroll } from "@/hooks/useBodyScrollLock";
import { useLocale } from "@/hooks/useLocale";
import { useUiStore } from "@/store/uiStore";
import { localize } from "@/utils/format";

const DEBOUNCE_MS = 250;

/**
 * Full-screen search overlay with autocomplete.
 *
 * Suggestions come from the service layer (`GET /search/suggest`): in mock mode they are filtered
 * locally, against the real API they are the endpoint's answer, and the UI stays identical.
 *
 * Only mounted while open, so the input and close button are never focusable behind the page.
 */
export function SearchOverlay() {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const isOpen = useUiStore((state) => state.overlay === "search");
  const closeOverlay = useUiStore((state) => state.closeOverlay);

  const [term, setTerm] = useState("");
  const debouncedTerm = useDebouncedValue(term, DEBOUNCE_MS);
  const inputRef = useRef<HTMLInputElement>(null);

  useLockBodyScroll(isOpen);
  useEscapeKey(isOpen, closeOverlay);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setTerm("");
    }
  }, [isOpen]);

  const { data, isPending } = useQuery({
    queryKey: ["search-suggest", debouncedTerm],
    queryFn: ({ signal }) => searchSuggest(debouncedTerm, signal),
    enabled: isOpen,
    staleTime: 30 * 1000,
  });

  const showPopular = debouncedTerm.trim() === "";

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("nav.search")}
      className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-bg/95 backdrop-blur-lg"
    >
      <div className="container-page flex h-16 shrink-0 items-center gap-3 lg:h-20">
        <Search aria-hidden="true" className="size-5 shrink-0 text-accent" />
        <input
          ref={inputRef}
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={t("nav.searchPlaceholder")}
          aria-label={t("nav.search")}
          className="h-full flex-1 bg-transparent font-heading text-lg outline-none placeholder:text-fg-muted sm:text-xl"
        />
        <IconButton
          label={t("nav.closeSearch")}
          onClick={closeOverlay}
          icon={<X aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="container-page flex-1 overflow-y-auto pb-16 pt-6">
        {isPending ? <SuggestionSkeleton /> : null}

        {!isPending && data !== undefined && data.suggestions.length === 0 ? (
          <p className="text-sm text-fg-muted">{t("nav.noSuggestions")}</p>
        ) : null}

        {!isPending && data !== undefined && data.suggestions.length > 0 ? (
          <ul className="divide-y divide-line border-y border-line">
            {data.suggestions.map((suggestion) => (
              <li key={`${suggestion.type}-${suggestion.href}`}>
                <Link
                  to={suggestion.href}
                  onClick={closeOverlay}
                  className="flex min-h-14 items-center gap-4 py-2 transition-colors duration-500 ease-smooth hover:text-accent"
                >
                  {suggestion.imageUrl === undefined ? null : (
                    <img
                      src={suggestion.imageUrl}
                      alt=""
                      width={44}
                      height={55}
                      loading="lazy"
                      className="size-11 shrink-0 object-cover"
                    />
                  )}
                  <span className="flex-1 text-sm">{localize(suggestion.label, locale)}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-fg-muted">
                    {t(`search.type.${suggestion.type}`)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {!isPending && data !== undefined && showPopular ? (
          <section className="mt-8">
            <h2 className="mb-4 font-heading text-xs uppercase tracking-[0.24em] text-fg-muted">
              {t("nav.popularSearches")}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {data.popularSearches.map((item) => (
                <li key={item.en}>
                  <button
                    type="button"
                    onClick={() => setTerm(item.en)}
                    className="min-h-11 rounded-pill border border-line px-4 text-sm transition-colors duration-500 ease-smooth hover:border-accent hover:text-accent"
                  >
                    {localize(item, locale)}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function SuggestionSkeleton() {
  return (
    <div className="space-y-3 border-y border-line py-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  );
}
