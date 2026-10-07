import { useTranslation } from "react-i18next";

import ReviewCard from "@/components/ReviewCard";
import { reviews } from "@/data/reviews";

export function Testimonials() {
  const { t } = useTranslation();

  return (
    <section className="container-page py-12">
      <h2 className="mb-6 font-heading text-heading-sm text-fg">
        {t("home.testimonials", "Testimonials")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {reviews.slice(0, 8).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
