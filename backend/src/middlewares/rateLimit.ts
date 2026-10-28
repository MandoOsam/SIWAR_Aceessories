import rateLimit from "express-rate-limit";

/**
 * Rate limiter factory (02-architecture §5). Auth routes are the sensitive
 * ones; limits are relaxed under NODE_ENV=test so the test suite is not
 * throttled.
 */
export function createRateLimiter(options?: {
  windowMs?: number;
  max?: number;
  message?: string;
}) {
  const isTest = process.env.NODE_ENV === "test";
  return rateLimit({
    windowMs: options?.windowMs ?? 15 * 60 * 1000,
    max: isTest ? 1000 : (options?.max ?? 20),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: {
          code: "RATE_LIMITED",
          message: options?.message ?? "Too many requests, please try again later",
          details: [],
        },
      });
    },
  });
}

/** Strict limiter for login/register. */
export const authRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });

/** Stricter limiter for staff login (fewer attempts allowed). */
export const adminAuthRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

/** Upload signatures are cheap to issue but open a spend path on Cloudinary. */
export const uploadRateLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 30 });

/** Coupon codes are guessable; throttle validation to slow enumeration down. */
export const couponRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 40 });

/** Reviews are public to submit; throttle anonymous spam. */
export const reviewRateLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 10 });
