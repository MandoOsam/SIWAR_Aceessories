/** Saved delivery address (`Address` in the frontend contract types). */
export type AddressDto = {
  id: string;
  governorate: string;
  city: string;
  street: string;
  building?: string;
  apartment?: string;
  phone: string;
  isDefault: boolean;
};

/** Create/update body; id and default flag are managed server-side. */
export type AddressInput = {
  governorate: string;
  city: string;
  street: string;
  building?: string;
  apartment?: string;
  phone: string;
};
