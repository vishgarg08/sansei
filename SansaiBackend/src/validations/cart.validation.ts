import Joi from "joi";

// ─── Cart Validations ───────────────────────────────────────────────────────

export const addToCartSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  variantId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).max(10).required(),
});

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(10).required(),
});

export const cartItemIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

// ─── Wishlist Validations ───────────────────────────────────────────────────

export const wishlistProductIdParamSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
});
