import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useHomeContent } from "@/hooks/useCatalog";
import { useLocale } from "@/hooks/useLocale";
import { fadeUp, reducedMotionVariants, stagger } from "@/utils/animations";
import { localize } from "@/utils/format";
import { cn } from "@/utils/cn";

import Hero3D from "./Hero3D";
import HeroBackground from "./HeroBackground";

const HERO_VIDEO_SRC = "/assets/hero/hero.mp4";
const HERO_POSTER_SRC = "/assets/hero/hero-poster.jpg";

/**
 * Home hero (05-ui-context.md §7.2 item 1): animated background, a single decorative 3D element,
 * the mixed serif/italic headline, the subline, two CTAs and a scroll indicator.
 */
export function Hero() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const shouldReduceMotion = useReducedMotion();
  const reducedMotion = shouldReduceMotion === true;
  const { data: content, isPending, isError, refetch } = useHomeContent();

  const containerVariants = reducedMotion ? reducedMotionVariants.stagger : stagger;
  const itemVariants = reducedMotion ? reducedMotionVariants.fadeUp : fadeUp;

  return (
    <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden">
      <HeroBackground videoSrc={HERO_VIDEO_SRC} posterSrc={HERO_POSTER_SRC} overlayOpacity={0.55} />

      {/* Decorative 3D ring, lazily loaded. Hidden on small screens to protect mobile perf. */}
      <div className="absolute end-[6%] top-1/2 hidden h-[360px] w-[360px] -translate-y-1/2 lg:block">
        <Hero3D fallbackImage={HERO_POSTER_SRC} />
      </div>

      <div className="container-page relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.p
            variants={itemVariants}
            className="font-heading text-xs uppercase tracking-[0.3em] text-accent"
          >
            SIWAR
          </motion.p>

          {isPending ? (
            <>
              <Skeleton className="mt-6 h-16 w-2/3 max-w-3xl" />
              <Skeleton className="mt-6 h-6 w-1/2 max-w-xl" />
            </>
          ) : isError ? (
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-6 inline-flex min-h-11 items-center bg-surface-2 px-4 text-sm text-fg-muted"
            >
              {t("common.retry")}
            </button>
          ) : content === undefined ? null : (
            <>
              <motion.h1
                variants={itemVariants}
                className="mt-6 max-w-3xl font-heading text-display-lg leading-[1.05] text-on-hero"
              >
                {localize(content.hero.headline, locale)}{" "}
                <em className="font-heading italic text-accent">
                  {localize(content.hero.headlineAccent, locale)}
                </em>
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="mt-6 max-w-xl text-lead text-on-hero-muted"
              >
                {localize(content.hero.subline, locale)}
              </motion.p>
              <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-4">
                <ButtonLink to={content.hero.primaryCta.href} size="lg">
                  {localize(content.hero.primaryCta.label, locale)}
                </ButtonLink>
                <ButtonLink to={content.hero.secondaryCta.href} size="lg" variant="secondary">
                  {localize(content.hero.secondaryCta.label, locale)}
                </ButtonLink>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>

      {reducedMotion ? null : (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute inset-x-0 bottom-6 z-10 flex justify-center"
        >
          <ChevronDown className={cn("h-6 w-6 animate-bounce text-on-hero-muted")} />
        </motion.div>
      )}
    </section>
  );
}

export default Hero;