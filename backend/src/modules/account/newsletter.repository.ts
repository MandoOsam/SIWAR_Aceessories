import { db } from "@/db/client.js";
import { newsletterSubscribers } from "@/db/schema/newsletter.js";

export async function subscribe(email: string): Promise<void> {
  await db
    .insert(newsletterSubscribers)
    .values({ email })
    .onConflictDoNothing({ target: newsletterSubscribers.email });
}
