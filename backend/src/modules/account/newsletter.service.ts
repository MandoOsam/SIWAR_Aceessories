import * as repo from "./newsletter.repository.js";

export async function subscribe(email: string): Promise<void> {
  await repo.subscribe(email);
}
