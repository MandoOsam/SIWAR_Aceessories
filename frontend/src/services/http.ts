/**
 * HTTP client for the real API.
 *
 * Exists so that switching from mock data to `backend/` is a configuration change only
 * (`VITE_API_URL`). Every request:
 *   - sends cookies, because auth is an httpOnly session cookie (D-005)
 *   - sends the CSRF token on mutations, required by the API contract (02-architecture.md §5)
 *   - unwraps the `{ data }` envelope and turns `{ error }` into a typed `ApiError`
 */

import { API_BASE_URL } from "@/config/env";

export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: unknown;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
  }
}

type ErrorEnvelope = { error: ApiErrorPayload };

let csrfToken: string | null = null;
let csrfRequest: Promise<string> | null = null;

/** Fetch the CSRF token once and reuse it for later mutations. */
async function getCsrfToken(): Promise<string> {
  if (csrfToken !== null) {
    return csrfToken;
  }
  csrfRequest ??= request<{ csrfToken: string }>("/auth/csrf", { method: "GET" })
    .then((response) => {
      csrfToken = response.csrfToken;
      return csrfToken;
    })
    .finally(() => {
      csrfRequest = null;
    });
  return csrfRequest;
}

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (MUTATION_METHODS.has(method)) {
    headers["X-CSRF-Token"] = await getCsrfToken();
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const envelope = payload as ErrorEnvelope | null;
    throw new ApiError(
      response.status,
      envelope?.error ?? {
        code: "UNEXPECTED_ERROR",
        message: `Request failed with status ${response.status}`,
      },
    );
  }

  return payload as T;
}

/** Unwraps the single-resource envelope `{ data: T }`. */
export async function getOne<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await request<{ data: T }>(path, { method: "GET", signal });
  return response.data;
}

/** Returns the collection envelope `{ data, total, page, limit }` untouched. */
export async function getList<T>(
  path: string,
  signal?: AbortSignal,
): Promise<{ data: T[]; total: number; page: number; limit: number }> {
  return request<{ data: T[]; total: number; page: number; limit: number }>(path, {
    method: "GET",
    signal,
  });
}

export async function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const response = await request<{ data: T }>(path, { method: "POST", body, signal });
  return response.data;
}

export async function patch<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const response = await request<{ data: T }>(path, { method: "PATCH", body, signal });
  return response.data;
}
