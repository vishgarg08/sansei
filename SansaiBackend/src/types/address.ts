import { Prisma } from "@prisma/client";

// ─── Prisma Select & Record ──────────────────────────────────────────────────

export const addressSelect = {
  id: true,
  userId: true,
  fullName: true,
  phone: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type AddressRecord = Prisma.AddressGetPayload<{
  select: typeof addressSelect;
}>;

// ─── Input Types ─────────────────────────────────────────────────────────────

export type CreateAddressInput = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
};

export type UpdateAddressInput = Partial<CreateAddressInput>;
