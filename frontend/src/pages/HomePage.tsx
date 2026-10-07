import { useTranslation } from "react-i18next";

import { Skeleton } from "@/components/ui/Skeleton";
import { useHomeContent } from "@/hooks/useCatalog";
import { useLocale } from "@/hooks/useLocale";
import { localize } from "@/utils/format";
import TrustStrip from "@/sections/home/TrustStrip";
import CategoryTiles from "@/sections/home/CategoryTiles";
import NewArrivals from "@/sections/home/NewArrivals";
import FeaturedCollections from "@/sections/home/FeaturedCollections";
import BestSellers from "@/sections/home/BestSellers";
import OffersSection from "@/sections/home/OffersSection";
import OurStory from "@/sections/home/OurStory";
import Recommended from "@/sections/home/Recommended";
import RecentlyViewed from "@/sections/home/RecentlyViewed";
import Testimonials from "@/sections/home/Testimonials";
import TrustBadges from "@/components/TrustBadges";
import Newsletter from "@/sections/home/Newsletter";

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
            loading="eager"
            className="absolute inset-0 -z-10 size-full object-cover"
          />
        )}
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

      <TrustStrip />
      <CategoryTiles />
      <NewArrivals />
      <FeaturedCollections />
      <BestSellers />
      <OffersSection />
      <OurStory />
      <Recommended />
      <RecentlyViewed />
      <Testimonials />
      <TrustBadges />
      <Newsletter />
    </>
  );
}
