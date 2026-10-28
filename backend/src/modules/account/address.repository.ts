import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db, type DbTransaction } from "@/db/client.js";
import { addresses, type Address, type NewAddress } from "@/db/schema/addresses.js";

export function listForUser(userId: string): Promise<Address[]> {
  return db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(desc(addresses.isDefault), asc(addresses.createdAt));
}

export async function countForUser(tx: DbTransaction, userId: string): Promise<number> {
  const rows = await tx
    .select({ total: sql<number>`count(*)::int` })
    .from(addresses)
    .where(eq(addresses.userId, userId));
  return rows[0]?.total ?? 0;
}

export async function findForUser(
  tx: DbTransaction,
  userId: string,
  id: string,
): Promise<Address | undefined> {
  const rows = await tx
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
    .for("update")
    .limit(1);
  return rows[0];
}

export async function insertAddress(tx: DbTransaction, values: NewAddress): Promise<Address> {
  const [row] = await tx.insert(addresses).values(values).returning();
  if (row === undefined) throw new Error("Could not create the address");
  return row;
}

export async function updateAddress(
  tx: DbTransaction,
  id: string,
  values: Partial<NewAddress>,
): Promise<Address> {
  const [row] = await tx
    .update(addresses)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(addresses.id, id))
    .returning();
  if (row === undefined) throw new Error("Could not update the address");
  return row;
}

export async function deleteAddress(tx: DbTransaction, id: string): Promise<void> {
  await tx.delete(addresses).where(eq(addresses.id, id));
}

/** Clears the customer's default flag before another row takes it over. */
export async function clearDefault(tx: DbTransaction, userId: string): Promise<void> {
  await tx
    .update(addresses)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true)));
}

/** Oldest remaining address, used to promote a replacement default. */
export async function findOldest(
  tx: DbTransaction,
  userId: string,
): Promise<Address | undefined> {
  const rows = await tx
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(asc(addresses.createdAt))
    .limit(1);
  return rows[0];
}
