import { Coupon } from "@prisma/client";
import { prisma } from "../prisma/prisma";
import { AppError } from "../utils/appError";
import { CreateCouponInput, UpdateCouponInput } from "../types/coupon";
import { getCart } from "./cart.service";

// ─── Serializer ─────────────────────────────────────────────────────────────

const serializeCoupon = (coupon: Coupon) => ({
  id: coupon.id,
  code: coupon.code,
  description: coupon.description,
  couponType: coupon.couponType,
  discountValue: Number(coupon.discountValue),
  maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
  minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
  maxUsagePerUser: coupon.maxUsagePerUser,
  maxTotalUsage: coupon.maxTotalUsage,
  totalUsed: coupon.totalUsed,
  isActive: coupon.isActive,
  expiresAt: coupon.expiresAt,
  createdAt: coupon.createdAt,
  updatedAt: coupon.updatedAt,
});

// ─── Error Handlers ─────────────────────────────────────────────────────────

const handleCouponWriteError = (error: any): never => {
  if (error.code === "P2002") {
    throw new AppError("A coupon with this code already exists", 409);
  }
  throw error;
};

// ─── Service Methods ────────────────────────────────────────────────────────

export const createCoupon = async (input: CreateCouponInput) => {
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: input.code.trim().toUpperCase(),
        description: input.description?.trim() || null,
        couponType: input.couponType,
        discountValue: input.discountValue,
        maxDiscount: input.maxDiscount !== undefined ? input.maxDiscount : null,
        minOrderAmount: input.minOrderAmount !== undefined ? input.minOrderAmount : null,
        maxUsagePerUser: input.maxUsagePerUser ?? 1,
        maxTotalUsage: input.maxTotalUsage !== undefined ? input.maxTotalUsage : null,
        isActive: input.isActive ?? true,
        expiresAt: new Date(input.expiresAt),
      },
    });

    return serializeCoupon(coupon);
  } catch (error) {
    handleCouponWriteError(error);
  }
};

export const getCoupons = async () => {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
  return coupons.map(serializeCoupon);
};

export const getCouponById = async (id: number) => {
  const coupon = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }

  return serializeCoupon(coupon);
};

export const updateCoupon = async (id: number, input: UpdateCouponInput) => {
  const existing = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError("Coupon not found", 404);
  }

  try {
    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        code: input.code !== undefined ? input.code.trim().toUpperCase() : undefined,
        description: input.description !== undefined ? (input.description?.trim() || null) : undefined,
        couponType: input.couponType,
        discountValue: input.discountValue,
        maxDiscount: input.maxDiscount,
        minOrderAmount: input.minOrderAmount,
        maxUsagePerUser: input.maxUsagePerUser,
        maxTotalUsage: input.maxTotalUsage,
        isActive: input.isActive,
        expiresAt: input.expiresAt !== undefined ? new Date(input.expiresAt) : undefined,
      },
    });

    return serializeCoupon(updated);
  } catch (error) {
    handleCouponWriteError(error);
  }
};

export const deleteCoupon = async (id: number): Promise<void> => {
  const existing = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError("Coupon not found", 404);
  }

  await prisma.coupon.delete({
    where: { id },
  });
};

export const applyCoupon = async (
  userId: number,
  code: string,
  orderAmount?: number
) => {
  // 1. Fetch Coupon
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }

  // 2. Validate Active Status
  if (!coupon.isActive) {
    throw new AppError("Coupon is inactive", 400);
  }

  // 3. Validate Expiry
  if (new Date() > new Date(coupon.expiresAt)) {
    throw new AppError("Coupon has expired", 400);
  }

  // 4. Determine and Validate Order Amount
  let finalOrderAmount = orderAmount;
  if (finalOrderAmount === undefined || finalOrderAmount === null) {
    const cart = await getCart(userId);
    finalOrderAmount = cart.cartTotal;
  }

  if (finalOrderAmount <= 0) {
    throw new AppError("Cart is empty. Add items to apply coupon.", 400);
  }

  // 5. Validate Minimum Order Amount
  const minAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
  if (finalOrderAmount < minAmount) {
    throw new AppError(
      `Minimum order amount of ${minAmount} is required to apply this coupon`,
      400
    );
  }

  // 6. Validate Max Total Usage
  if (coupon.maxTotalUsage !== null && coupon.totalUsed >= coupon.maxTotalUsage) {
    throw new AppError("Coupon usage limit has been reached", 400);
  }

  // 7. Validate User Usage Limit
  const userUsageCount = await prisma.order.count({
    where: {
      userId,
      couponCode: coupon.code,
      status: { notIn: ["CANCELLED"] },
    },
  });

  if (userUsageCount >= coupon.maxUsagePerUser) {
    throw new AppError(
      `You have already used this coupon the maximum number of times (${coupon.maxUsagePerUser})`,
      400
    );
  }

  // 8. Calculate Discount
  let discount = 0;
  if (coupon.couponType === "FIXED") {
    discount = Number(coupon.discountValue);
    if (discount > finalOrderAmount) {
      discount = finalOrderAmount;
    }
  } else if (coupon.couponType === "PERCENTAGE") {
    discount = finalOrderAmount * (Number(coupon.discountValue) / 100);
    if (coupon.maxDiscount !== null) {
      const maxDiscountVal = Number(coupon.maxDiscount);
      if (discount > maxDiscountVal) {
        discount = maxDiscountVal;
      }
    }
  }

  // Round values to 2 decimal places
  discount = Math.round(discount * 100) / 100;
  const finalAmount = Math.max(0, Math.round((finalOrderAmount - discount) * 100) / 100);

  return {
    discount,
    finalAmount,
  };
};