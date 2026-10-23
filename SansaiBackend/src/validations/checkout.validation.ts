import Joi from "joi";

// ─── Checkout Validations ───────────────────────────────────────────────────

export const checkoutSchema = Joi.object({
  addressId: Joi.number().integer().positive().required(),
  couponCode: Joi.string().trim().max(50).optional(),
  paymentMethod: Joi.string().valid("RAZORPAY", "COD").required(),
  customerNotes: Joi.string().trim().max(500).optional().allow("", null),
});
