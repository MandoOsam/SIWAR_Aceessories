import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";

import { ButtonLink } from "@/components/ui/Button";
import { useLocale } from "@/hooks/useLocale";

export function OurStory() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -40]);

  const imageUrl = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  return (
    <section className="relative isolate overflow-hidden">
      <motion.div
        style={{ y }}
        className="absolute inset-0 -z-10"
      >
        <img
          src={imageUrl}
          alt="Our story"
          width={1920}
          height={1080}
          loading="lazy"
          className="size-full object-cover"
        />
      </motion.div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/50" />
      <div className="container-page flex min-h-[60vh] flex-col items-start justify-center py-16 text-on-hero">
        <h2 className="font-heading text-heading-md">{t("home.ourStory", "Our Story")}</h2>
        <p className="mt-4 max-w-2xl text-lead text-on-hero-muted">
          {locale === "ar" 
            ? "سيوار هو بيت المجوهرات المصنوعة من الفولاذ المقاوم للصدأ للمرأة المصرية. تصميمات بسيطة أنيقة تدوم معك اليوم وغداً."
            : "SIWAR is a home for timeless stainless steel jewelry designed for Egyptian women. Minimal, elegant designs that last for years to come."}
        </p>
        <ButtonLink to="/about" className="mt-6">{t("home.learnMore", "Learn more")}</ButtonLink>
      </div>
    </section>
  );
}

export default OurStory;
