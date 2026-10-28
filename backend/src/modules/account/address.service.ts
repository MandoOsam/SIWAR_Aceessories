import { db } from "@/db/client.js";
import { AppError } from "@/middlewares/errorHandler.js";
import type { AddressDto } from "@/types/account.js";
import { toAddressDto } from "./address.mapper.js";
import * as repo from "./address.repository.js";
import type { AddressBody } from "./schema.js";

type AddressList = { data: AddressDto[]; total: number; page: number; limit: number };

function notFound(): AppError {
  return new AppError("NOT_FOUND", 404, "Address not found");
}

function valuesFor(input: AddressBody) {
  return {
    governorate: input.governorate,
    city: input.city,
    street: input.street,
    building: input.building ?? null,
    apartment: input.apartment ?? null,
    phone: input.phone,
  };
}

export async function listAddresses(userId: string): Promise<AddressList> {
  const rows = await repo.listForUser(userId);
  return { data: rows.map(toAddressDto), total: rows.length, page: 1, limit: rows.length };
}

/** The first saved address becomes the default automatically. */
export async function createAddress(
  userId: string,
  input: AddressBody,
): Promise<AddressDto> {
  return db.transaction(async (tx) => {
    const total = await repo.countForUser(tx, userId);
    const row = await repo.insertAddress(tx, {
      userId,
      ...valuesFor(input),
      isDefault: total === 0,
    });
    return toAddressDto(row);
  });
}

export async function updateAddress(
  userId: string,
  id: string,
  input: AddressBody,
): Promise<AddressDto> {
  return db.transaction(async (tx) => {
    const existing = await repo.findForUser(tx, userId, id);
    if (existing === undefined) throw notFound();
    const row = await repo.updateAddress(tx, id, valuesFor(input));
    return toAddressDto(row);
  });
}

/** Deleting the default promotes the oldest remaining address. */
export async function deleteAddress(userId: string, id: string): Promise<void> {
  await db.transaction(async (tx) => {
    const existing = await repo.findForUser(tx, userId, id);
    if (existing === undefined) throw notFound();

    await repo.deleteAddress(tx, id);
    if (existing.isDefault) {
      const replacement = await repo.findOldest(tx, userId);
      if (replacement !== undefined) {
        await repo.updateAddress(tx, replacement.id, { isDefault: true });
      }
    }
  });
}

export async function setDefaultAddress(userId: string, id: string): Promise<AddressDto> {
  return db.transaction(async (tx) => {
    const existing = await repo.findForUser(tx, userId, id);
    if (existing === undefined) throw notFound();

    await repo.clearDefault(tx, userId);
    const row = await repo.updateAddress(tx, id, { isDefault: true });
    return toAddressDto(row);
  });
}
