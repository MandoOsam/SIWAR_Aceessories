import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { useLocale } from "@/hooks/useLocale";
import type { ProductReviewInput } from "@/services/types";
import { toast } from "@/store/toastStore";
import { cn } from "@/utils/cn";

const RATING_VALUES = [1, 2, 3, 4, 5] as const;
const MAX_IMAGES = 5;

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  authorName: z.string().trim().min(2),
  text: z.string().trim().min(10),
  images: z.array(z.url()).max(MAX_IMAGES),
});

type FieldName = "rating" | "authorName" | "text" | "images";
type FieldErrors = Partial<Record<FieldName, string>>;

const INPUT_CLASSES =
  "w-full rounded-control border border-line bg-surface px-4 py-2 text-fg " +
  "placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-accent";

export interface ReviewFormProps {
  /** Wired to the existing `useProductReviews` hook's `submit` (which calls `submitProductReview`). */
  onSubmit: (input: ProductReviewInput) => Promise<unknown>;
  className?: string;
}

/**
 * Public review form (05-ui-context.md §7.5).
 *
 * Validation is Zod + controlled state, matching the existing `Newsletter` form (D-011) — no form
 * library is added. There is no translation service yet, so the entered text is stored in **both**
 * `L10n` fields (D-036); the admin splits the languages later. Submitted reviews are moderated
 * (`pending`), so the success message says "submitted", not "published".
 */
export function ReviewForm({ onSubmit, className }: ReviewFormProps) {
  const { t } = useTranslation();
  const { isRtl } = useLocale();

  const [rating, setRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [text, setText] = useState("");
  const [images, setImages] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingGroupRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const imagesRef = useRef<HTMLTextAreaElement>(null);

  const clearError = (field: FieldName): void => {
    setErrors((current) => (current[field] === undefined ? current : { ...current, [field]: undefined }));
  };

  const focusFirstError = (nextErrors: FieldErrors): void => {
    if (nextErrors.rating !== undefined) {
      ratingGroupRef.current?.querySelector<HTMLButtonElement>('[role="radio"]')?.focus();
    } else if (nextErrors.authorName !== undefined) {
      nameRef.current?.focus();
    } else if (nextErrors.text !== undefined) {
      textRef.current?.focus();
    } else if (nextErrors.images !== undefined) {
      imagesRef.current?.focus();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSubmitError(null);

    const imageList = images
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== "");

    const result = reviewSchema.safeParse({ rating, authorName, text, images: imageList });
    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === "rating" && nextErrors.rating === undefined) {
          nextErrors.rating = t("product.reviews.form.ratingError");
        } else if (field === "authorName" && nextErrors.authorName === undefined) {
          nextErrors.authorName = t("product.reviews.form.nameError");
        } else if (field === "text" && nextErrors.text === undefined) {
          nextErrors.text = t("product.reviews.form.textError");
        } else if (field === "images" && nextErrors.images === undefined) {
          nextErrors.images = t("product.reviews.form.imagesError");
        }
      }
      setErrors(nextErrors);
      focusFirstError(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit({
        authorName: result.data.authorName,
        rating: result.data.rating,
        text: { ar: result.data.text, en: result.data.text },
        images: result.data.images,
      });
      toast(t("product.reviews.form.success"));
      setRating(0);
      setAuthorName("");
      setText("");
      setImages("");
    } catch {
      setSubmitError(t("product.reviews.form.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
    if (!keys.includes(event.key)) return;

    const increase = event.key === "ArrowUp" || (isRtl ? event.key === "ArrowLeft" : event.key === "ArrowRight");
    const decrease = event.key === "ArrowDown" || (isRtl ? event.key === "ArrowRight" : event.key === "ArrowLeft");
    if (!increase && !decrease) return;

    event.preventDefault();
    setRating((current) => Math.min(Math.max(current + (increase ? 1 : -1), 1), 5));
    clearError("rating");
  };

  const hasErrors = Object.values(errors).some((value) => value !== undefined);

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className={cn("space-y-5", className)}>
      <h3 className="font-heading text-heading-sm text-fg">{t("product.reviews.form.heading")}</h3>

      <div className="space-y-2">
        <span className="text-sm font-medium text-fg">{t("product.reviews.form.ratingLabel")}</span>
        <div
          ref={ratingGroupRef}
          role="radiogroup"
          aria-label={t("product.reviews.form.ratingLabel")}
          aria-invalid={errors.rating !== undefined}
          aria-describedby={errors.rating !== undefined ? "review-rating-error" : undefined}
          onKeyDown={handleRatingKeyDown}
          className="flex items-center gap-1"
        >
          {RATING_VALUES.map((value, index) => {
            const isSelected = rating === value;
            const isFilled = value <= rating;
            const isFocusable = isSelected || (rating === 0 && index === 0);
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={t("product.reviews.form.starLabel", { value })}
                tabIndex={isFocusable ? 0 : -1}
                onClick={() => {
                  setRating(value);
                  clearError("rating");
                }}
                className="rounded-control p-1 transition-colors duration-300 ease-smooth hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Star
                  className={cn("h-7 w-7", isFilled ? "fill-accent text-accent" : "text-fg-muted")}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
        {errors.rating !== undefined && (
          <p id="review-rating-error" role="alert" className="text-sm text-accent-2">
            {errors.rating}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="review-name" className="text-sm font-medium text-fg">
          {t("product.reviews.form.nameLabel")}
        </label>
        <input
          id="review-name"
          ref={nameRef}
          type="text"
          value={authorName}
          onChange={(event) => {
            setAuthorName(event.target.value);
            clearError("authorName");
          }}
          placeholder={t("product.reviews.form.namePlaceholder")}
          aria-invalid={errors.authorName !== undefined}
          aria-describedby={errors.authorName !== undefined ? "review-name-error" : undefined}
          className={INPUT_CLASSES}
        />
        {errors.authorName !== undefined && (
          <p id="review-name-error" role="alert" className="text-sm text-accent-2">
            {errors.authorName}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="review-text" className="text-sm font-medium text-fg">
          {t("product.reviews.form.textLabel")}
        </label>
        <textarea
          id="review-text"
          ref={textRef}
          rows={4}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            clearError("text");
          }}
          placeholder={t("product.reviews.form.textPlaceholder")}
          aria-invalid={errors.text !== undefined}
          aria-describedby={errors.text !== undefined ? "review-text-error" : undefined}
          className={INPUT_CLASSES}
        />
        {errors.text !== undefined && (
          <p id="review-text-error" role="alert" className="text-sm text-accent-2">
            {errors.text}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="review-images" className="text-sm font-medium text-fg">
          {t("product.reviews.form.imagesLabel")}
        </label>
        <textarea
          id="review-images"
          ref={imagesRef}
          rows={2}
          value={images}
          onChange={(event) => {
            setImages(event.target.value);
            clearError("images");
          }}
          placeholder={t("product.reviews.form.imagesPlaceholder")}
          aria-invalid={errors.images !== undefined}
          aria-describedby={errors.images !== undefined ? "review-images-error" : "review-images-hint"}
          className={INPUT_CLASSES}
        />
        {errors.images !== undefined ? (
          <p id="review-images-error" role="alert" className="text-sm text-accent-2">
            {errors.images}
          </p>
        ) : (
          <p id="review-images-hint" className="text-xs text-fg-muted">
            {t("product.reviews.form.imagesHint")}
          </p>
        )}
      </div>

      {hasErrors && (
        <p role="alert" className="text-sm text-accent-2">
          {t("product.reviews.form.errorSummary")}
        </p>
      )}
      {submitError !== null && (
        <p role="alert" className="text-sm text-accent-2">
          {submitError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("product.reviews.form.submitting") : t("product.reviews.form.submit")}
      </Button>
    </form>
  );
}

export default ReviewForm;
