import Joi from "joi";

const money = Joi.number().min(0).precision(2);

const inventoryActionValues = ["IN", "OUT", "RETURN", "CANCELLED", "MANUAL"] as const;

// ─── Param Schemas ───────────────────────────────────────────────────────────

export const productIdParamSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
});

export const variantIdParamSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  variantId: Joi.number().integer().positive().required(),
});

// ─── Create Variants ─────────────────────────────────────────────────────────

const createVariantItemSchema = Joi.object({
  size: Joi.string().trim().max(100).required(),
  color: Joi.string().trim().max(100).required(),
  sku: Joi.string().trim().max(100).required(),
  price: money.allow(null).optional(),
  stock: Joi.number().integer().min(0).optional(),
});

export const createVariantsSchema = Joi.object({
  variants: Joi.array().items(createVariantItemSchema).min(1).max(100).required(),
});

// ─── Update Variant ──────────────────────────────────────────────────────────

export const updateVariantSchema = Joi.object({
  size: Joi.string().trim().max(100).optional(),
  color: Joi.string().trim().max(100).optional(),
  sku: Joi.string().trim().max(100).optional(),
  price: money.allow(null).optional(),
  stock: Joi.number().integer().min(0).optional(),
}).min(1);

// ─── Stock Update ────────────────────────────────────────────────────────────

export const updateStockSchema = Joi.object({
  action: Joi.string()
    .valid(...inventoryActionValues)
    .required(),
  quantity: Joi.number().integer().positive().required(),
  reference: Joi.string().trim().max(255).empty("").optional(),
  notes: Joi.string().trim().max(1000).empty("").optional(),
});

// ─── Bulk Stock Update ───────────────────────────────────────────────────────

const bulkStockItemSchema = Joi.object({
  variantId: Joi.number().integer().positive().required(),
  action: Joi.string()
    .valid(...inventoryActionValues)
    .required(),
  quantity: Joi.number().integer().positive().required(),
  reference: Joi.string().trim().max(255).empty("").optional(),
  notes: Joi.string().trim().max(1000).empty("").optional(),
});

export const bulkStockUpdateSchema = Joi.object({
  items: Joi.array().items(bulkStockItemSchema).min(1).max(100).required(),
});
