import Joi from "joi";

// ─── Coupon Validations ──────────────────────────────────────────────────────

export const createCouponSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9_-]{3,20}$/)
    .required()
    .messages({
      "string.pattern.base": "Coupon code must be alphanumeric (3-20 characters) and uppercase",
    }),
  description: Joi.string().trim().allow(null, "").optional(),
  couponType: Joi.string().valid("PERCENTAGE", "FIXED").required(),
  discountValue: Joi.number().positive().required(),
  maxDiscount: Joi.number().min(0).allow(null).optional(),
  minOrderAmount: Joi.number().min(0).allow(null).optional(),
  maxUsagePerUser: Joi.number().integer().positive().default(1).optional(),
  maxTotalUsage: Joi.number().integer().positive().allow(null).optional(),
  isActive: Joi.boolean().default(true).optional(),
  expiresAt: Joi.date().iso().required(),
});

export const updateCouponSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9_-]{3,20}$/)
    .optional()
    .messages({
      "string.pattern.base": "Coupon code must be alphanumeric (3-20 characters) and uppercase",
    }),
  description: Joi.string().trim().allow(null, "").optional(),
  couponType: Joi.string().valid("PERCENTAGE", "FIXED").optional(),
  discountValue: Joi.number().positive().optional(),
  maxDiscount: Joi.number().min(0).allow(null).optional(),
  minOrderAmount: Joi.number().min(0).allow(null).optional(),
  maxUsagePerUser: Joi.number().integer().positive().optional(),
  maxTotalUsage: Joi.number().integer().positive().allow(null).optional(),
  isActive: Joi.boolean().optional(),
  expiresAt: Joi.date().iso().optional(),
}).min(1);

export const couponIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const applyCouponSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9_-]{3,20}$/)
    .required()
    .messages({
      "string.pattern.base": "Coupon code must be alphanumeric (3-20 characters) and uppercase",
    }),
  orderAmount: Joi.number().positive().optional(),
});
