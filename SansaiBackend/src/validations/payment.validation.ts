import Joi from "joi";

// ─── Payment Validations ───────────────────────────────────────────────────

export const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().trim().required(),
  razorpay_payment_id: Joi.string().trim().required(),
  razorpay_signature: Joi.string().trim().required(),
});

export const paymentFailureSchema = Joi.object({
  razorpay_order_id: Joi.string().trim().required(),
  errorCode: Joi.string().trim().optional(),
  errorDescription: Joi.string().trim().max(500).optional(),
});
