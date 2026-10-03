/**
 * Mock data helpers.
 *
 * Simulates the API's latency and error envelope so loading states and error states behave the
 * same in mock mode as they will against `backend/`.
 */

const MOCK_LATENCY_MS = 350;

export function simulateLatency(signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, MOCK_LATENCY_MS);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("The request was aborted.", "AbortError"));
      },
      { once: true },
    );
  });
}

/** Builds the `{ data, total, page, limit }` envelope defined in 02-architecture.md §4. */
export function paginate<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total,
    page,
    limit,
  };
}
