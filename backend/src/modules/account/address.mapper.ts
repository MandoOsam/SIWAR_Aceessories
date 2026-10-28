import type { Address } from "@/db/schema/addresses.js";
import type { AddressDto } from "@/types/account.js";

export function toAddressDto(address: Address): AddressDto {
  return {
    id: address.id,
    governorate: address.governorate,
    city: address.city,
    street: address.street,
    ...(address.building === null ? {} : { building: address.building }),
    ...(address.apartment === null ? {} : { apartment: address.apartment }),
    phone: address.phone,
    isDefault: address.isDefault,
  };
}
