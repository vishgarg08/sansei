import { Prisma, CouponType } from "@prisma/client";

// ─── Prisma Select & Record ──────────────────────────────────────────────────

export const couponSelect = {
  id: true,
  code: true,
  description: true,
  couponType: true,
  discountValue: true,
  maxDiscount: true,
  minOrderAmount: true,
  maxUsagePerUser: true,
  maxTotalUsage: true,
  totalUsed: true,
  isActive: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type CouponRecord = Prisma.CouponGetPayload<{
  select: typeof couponSelect;
}>;

// ─── Input Types ─────────────────────────────────────────────────────────────

export type CreateCouponInput = {
  code: string;
  description?: string | null;
  couponType: CouponType;
  discountValue: number;
  maxDiscount?: number | null;
  minOrderAmount?: number | null;
  maxUsagePerUser?: number;
  maxTotalUsage?: number | null;
  isActive?: boolean;
  expiresAt: string; // ISO string Date representation
};

export type UpdateCouponInput = Partial<CreateCouponInput>;

export type ApplyCouponInput = {
  code: string;
  orderAmount?: number;
};
