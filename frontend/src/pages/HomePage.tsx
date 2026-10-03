import { useTranslation } from "react-i18next";

import { Skeleton } from "@/components/ui/Skeleton";
import { useHomeContent } from "@/hooks/useCatalog";
import { useLocale } from "@/hooks/useLocale";
import { localize } from "@/utils/format";

/**
 * Home page shell.
 *
 * F1 delivers only the layer that F2 builds on: a hero-height block with the dark poster and the
 * headline coming from `GET /content/home`. It exists so the navbar's transparent-to-solid
 * behaviour can be verified on the real home route.
 *
 * TODO(F2): animated background, 3D element, CTAs, scroll indicator and all remaining sections.
 */
export default function HomePage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { data: content, isPending, isError, refetch } = useHomeContent();

  return (
    <>
      <section className="relative isolate flex min-h-[78vh] items-center overflow-hidden">
        {isPending ? (
          <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
        ) : isError ? (
          <button
            type="button"
            onClick={() => void refetch()}
            className="absolute inset-0 flex items-center justify-center bg-surface-2 text-sm text-fg-muted"
          >
            {t("common.retry")}
          </button>
        ) : content?.hero.posterUrl === undefined ? (
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-bg" />
        ) : (
          <img
            src={content.hero.posterUrl}
            alt=""
            aria-hidden="true"
            width={1920}
            height={1080}
            // The poster is the first paint, so it is eager; F2 replaces it with a lazy video.
            loading="eager"
            className="absolute inset-0 -z-10 size-full object-cover"
          />
        )}

        {/* Overlay keeps the headline readable (05-ui-context.md §5.4). */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/55" />

        <div className="container-page">
          <p className="font-heading text-xs uppercase tracking-[0.3em] text-accent">SIWAR</p>
          <h1 className="mt-6 max-w-3xl font-heading text-display-lg leading-[1.05] text-on-hero">
            {content === undefined ? null : (
              <>
                {localize(content.hero.headline, locale)}{" "}
                <em className="font-heading italic text-accent">
                  {localize(content.hero.headlineAccent, locale)}
                </em>
              </>
            )}
          </h1>
          {content === undefined ? null : (
            <p className="mt-6 max-w-xl text-lead text-on-hero-muted">
              {localize(content.hero.subline, locale)}
            </p>
          )}
        </div>
      </section>

      <div className="container-page py-24">
        <p className="mx-auto max-w-xl text-center text-sm text-fg-muted">
          {t("common.comingSoon", { phase: "F2" })}
        </p>
      </div>
    </>
  );
}
