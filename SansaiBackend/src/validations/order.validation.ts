import Joi from "joi";

// ─── Order Validations ─────────────────────────────────────────────────────

export const orderIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const cancelOrderSchema = Joi.object({
  reason: Joi.string().trim().min(5).max(500).required(),
});

export const orderListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string()
    .valid(
      "PENDING",
      "CONFIRMED",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RETURN_REQUESTED",
      "RETURNED"
    )
    .optional(),
});

// ─── Admin Order Validations ────────────────────────────────────────────────

export const adminOrderListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string()
    .valid(
      "PENDING",
      "CONFIRMED",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RETURN_REQUESTED",
      "RETURNED"
    )
    .optional(),
  paymentStatus: Joi.string()
    .valid("PENDING", "SUCCESS", "FAILED", "REFUNDED")
    .optional(),
  userId: Joi.number().integer().positive().optional(),
  search: Joi.string().trim().max(100).optional(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "CONFIRMED",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RETURN_REQUESTED",
      "RETURNED"
    )
    .required(),
  notes: Joi.string().trim().max(500).optional().allow("", null),
  shippingTrackingId: Joi.string().trim().max(100).optional().allow("", null),
});
