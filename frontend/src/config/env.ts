/**
 * Runtime configuration read from Vite env vars.
 *
 * `VITE_API_URL` is the single switch between mock data and the real API
 * (05-ui-context.md section 6): empty means stay on the mock service layer, set means call
 * `backend/` at `/api/v1`. Components never see this value.
 */

const RAW_API_URL = import.meta.env.VITE_API_URL ?? "";

export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, "");

export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "";

/** True while the storefront runs on `src/data/` instead of the real API. */
export const IS_MOCK_MODE = API_BASE_URL === "";
