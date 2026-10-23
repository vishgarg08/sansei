import { Address } from "@prisma/client";
import { prisma } from "../prisma/prisma";
import { AppError } from "../utils/appError";
import { CreateAddressInput, UpdateAddressInput } from "../types/address";

// ─── Types ──────────────────────────────────────────────────────────────────
// Moved to src/types/address.ts


// ─── Serializer ─────────────────────────────────────────────────────────────

export const serializeAddress = (address: Address) => ({
  id: address.id,
  userId: address.userId,
  fullName: address.fullName,
  phone: address.phone,
  addressLine1: address.addressLine1,
  addressLine2: address.addressLine2,
  city: address.city,
  state: address.state,
  postalCode: address.postalCode,
  country: address.country,
  isDefault: address.isDefault,
  createdAt: address.createdAt,
  updatedAt: address.updatedAt,
});

// ─── Service Methods ────────────────────────────────────────────────────────

export const createAddress = async (userId: number, input: CreateAddressInput) => {
  return await prisma.$transaction(async (tx) => {
    // If the user has no existing addresses, this new one must automatically be the default
    const existingCount = await tx.address.count({
      where: { userId },
    });

    const isDefault = existingCount === 0 ? true : !!input.isDefault;

    // If this address is set as default, update all existing user addresses to not be default
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await tx.address.create({
      data: {
        userId,
        fullName: input.fullName.trim(),
        phone: input.phone.trim(),
        addressLine1: input.addressLine1.trim(),
        addressLine2: input.addressLine2?.trim() || null,
        city: input.city.trim(),
        state: input.state.trim(),
        postalCode: input.postalCode.trim(),
        country: input.country?.trim() || "IN",
        isDefault,
      },
    });

    return serializeAddress(address);
  });
};

export const getAddresses = async (userId: number) => {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" },
    ],
  });

  return addresses.map(serializeAddress);
};

export const updateAddress = async (
  userId: number,
  addressId: number,
  input: UpdateAddressInput
) => {
  return await prisma.$transaction(async (tx) => {
    const existingAddress = await tx.address.findFirst({
      where: { id: addressId, userId },
      select: { id: true, isDefault: true },
    });

    if (!existingAddress) {
      throw new AppError("Address not found", 404);
    }

    // Determine the new value of isDefault. If not provided, keep current value.
    // If it was already the default, and input is trying to set isDefault to false,
    // we should prevent that if it's their only address, or let it change depending on design.
    // However, to keep it simple, if setting isDefault to true, we unset other default addresses.
    const isDefault = input.isDefault !== undefined ? input.isDefault : existingAddress.isDefault;

    if (isDefault && !existingAddress.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await tx.address.update({
      where: { id: addressId },
      data: {
        fullName: input.fullName !== undefined ? input.fullName.trim() : undefined,
        phone: input.phone !== undefined ? input.phone.trim() : undefined,
        addressLine1: input.addressLine1 !== undefined ? input.addressLine1.trim() : undefined,
        addressLine2: input.addressLine2 !== undefined ? (input.addressLine2?.trim() || null) : undefined,
        city: input.city !== undefined ? input.city.trim() : undefined,
        state: input.state !== undefined ? input.state.trim() : undefined,
        postalCode: input.postalCode !== undefined ? input.postalCode.trim() : undefined,
        country: input.country !== undefined ? input.country.trim() : undefined,
        isDefault,
      },
    });

    return serializeAddress(updated);
  });
};

export const deleteAddress = async (userId: number, addressId: number): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const existingAddress = await tx.address.findFirst({
      where: { id: addressId, userId },
      select: { id: true, isDefault: true },
    });

    if (!existingAddress) {
      throw new AppError("Address not found", 404);
    }

    await tx.address.delete({
      where: { id: addressId },
    });

    // If we deleted the default address, set another remaining address as default
    if (existingAddress.isDefault) {
      const nextAddress = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });

      if (nextAddress) {
        await tx.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }
  });
};
