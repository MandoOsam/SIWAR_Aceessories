import { Fragment, useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { History, Search, TrendingUp, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/utils/cn";
import { localize } from "@/utils/format";
import { ROUTES } from "@/config/app";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useLocale } from "@/hooks/useLocale";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { FILTER_PARAM } from "@/hooks/useProductFilters";
import { searchSuggest } from "@/services/api";

const DEBOUNCE_MS = 250;
const LISTBOX_ID = "siwar-search-autocomplete-listbox";

type OptionSection = "recent" | "popular" | "suggestion";

type Option = {
  id: string;
  label: string;
  section: OptionSection;
  action: "search" | "clear";
};

export type SearchAutocompleteProps = {
  /** Current query from the URL; seeds the field and re-syncs after navigation. */
  query: string;
  className?: string;
};

/**
 * Inline search combobox for `/search` (05-ui-context.md §7.6, D-019).
 *
 * This is deliberately separate from the F1 full-screen `components/layout/SearchOverlay.tsx`
 * (which stays untouched): that is the navbar overlay, this is the on-page field. It combines
 * debounced suggestions (`GET /search/suggest`), recent terms (localStorage) and popular terms
 * into one accessible listbox. Selecting anything navigates to `/search?q=…`.
 */
export function SearchAutocomplete({ query, className }: SearchAutocompleteProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const { recents, addRecent, clearRecents } = useRecentSearches();

  const [term, setTerm] = useState(query);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedTerm = useDebouncedValue(term.trim(), DEBOUNCE_MS);
  const isQueryEmpty = debouncedTerm === "";

  useEffect(() => {
    setTerm(query);
  }, [query]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedTerm]);

  const { data, isPending } = useQuery({
    queryKey: ["search-suggest", debouncedTerm],
    queryFn: ({ signal }) => searchSuggest(debouncedTerm, signal),
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onPointerDown = (event: PointerEvent): void => {
      if (containerRef.current !== null && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  const submit = useCallback(
    (value: string) => {
      const next = value.trim();
      if (next === "") {
        return;
      }
      addRecent(next);
      setIsOpen(false);
      setActiveIndex(-1);
      navigate(`${ROUTES.search}?${FILTER_PARAM.search}=${encodeURIComponent(next)}`);
    },
    [addRecent, navigate],
  );

  const recentOptions: Option[] = isQueryEmpty
    ? recents.map((item) => ({
        id: `recent-${encodeURIComponent(item)}`,
        label: item,
        section: "recent",
        action: "search",
      }))
    : [];
  if (recentOptions.length > 0) {
    recentOptions.push({
      id: "clear-recents",
      label: t("search.clearRecent"),
      section: "recent",
      action: "clear",
    });
  }
  const popularOptions: Option[] = isQueryEmpty
    ? (data?.popularSearches ?? []).map((item, index) => ({
        id: `popular-${index}`,
        label: localize(item, locale),
        section: "popular",
        action: "search",
      }))
    : [];
  const suggestionOptions: Option[] = isQueryEmpty
    ? []
    : (data?.suggestions ?? []).map((item, index) => ({
        id: `suggestion-${index}`,
        label: localize(item.label, locale),
        section: "suggestion",
        action: "search",
      }));

  const options = [...recentOptions, ...popularOptions, ...suggestionOptions];

  const activate = useCallback(
    (option: Option) => {
      if (option.action === "clear") {
        clearRecents();
        setActiveIndex(-1);
        return;
      }
      submit(option.label);
    },
    [clearRecents, submit],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (options.length === 0 ? -1 : (current + 1) % options.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        options.length === 0 ? -1 : (current - 1 + options.length) % options.length,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = activeIndex >= 0 ? options[activeIndex] : undefined;
      if (option === undefined) {
        submit(term);
      } else {
        activate(option);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  const activeOptionId =
    isOpen && activeIndex >= 0 && activeIndex < options.length
      ? options[activeIndex]?.id
      : undefined;

  const announcement =
    isQueryEmpty || isPending
      ? ""
      : t("search.suggestionsAnnounce", { count: suggestionOptions.length });

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 start-4 my-auto size-4 text-fg-muted"
        />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={LISTBOX_ID}
          aria-activedescendant={activeOptionId}
          aria-autocomplete="list"
          aria-label={t("search.placeholder")}
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t("search.placeholder")}
          className="min-h-12 w-full rounded-control border border-line bg-surface ps-11 pe-4 text-sm text-fg outline-none transition-colors duration-500 ease-smooth placeholder:text-fg-muted focus:border-accent"
        />
      </div>

      {isOpen ? (
        <div
          id={LISTBOX_ID}
          role="listbox"
          aria-label={t("search.suggestionsLabel")}
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-[70dvh] overflow-y-auto overscroll-contain rounded-card border border-line bg-surface py-2 text-start"
        >
          {options.map((option, index) => {
            const previous = index > 0 ? options[index - 1] : undefined;
            const startsSection = previous === undefined || previous.section !== option.section;
            return (
              <Fragment key={option.id}>
                {startsSection ? (
                  <div
                    role="presentation"
                    className="px-4 pb-1 pt-3 font-heading text-[10px] uppercase tracking-[0.24em] text-fg-muted"
                  >
                    {option.section === "recent"
                      ? t("search.recentSearches")
                      : option.section === "popular"
                        ? t("search.popularSearches")
                        : t("search.suggestions")}
                  </div>
                ) : null}
                <div
                  role="option"
                  id={option.id}
                  aria-selected={activeIndex === index}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => activate(option)}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-3 px-4 text-sm text-fg",
                    activeIndex === index ? "bg-bg text-accent" : "hover:bg-bg",
                  )}
                >
                  {option.action === "clear" ? (
                    <X aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
                  ) : option.section === "recent" ? (
                    <History aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
                  ) : option.section === "popular" ? (
                    <TrendingUp aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
                  ) : (
                    <Search aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
                  )}
                  <span className="flex-1">{option.label}</span>
                </div>
              </Fragment>
            );
          })}

          {!isQueryEmpty && !isPending && suggestionOptions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-fg-muted">{t("nav.noSuggestions")}</p>
          ) : null}
        </div>
      ) : null}

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

export default SearchAutocomplete;
