import Joi from "joi";

// ─── Inventory Log Query ─────────────────────────────────────────────────────

export const inventoryLogQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  productId: Joi.number().integer().positive().optional(),
  variantId: Joi.number().integer().positive().optional(),
  action: Joi.string()
    .valid("IN", "OUT", "RETURN", "CANCELLED", "MANUAL")
    .optional(),
  reference: Joi.string().trim().max(100).optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().min(Joi.ref("dateFrom")).optional(),
});

// ─── Variant Log Params ──────────────────────────────────────────────────────

export const variantInventoryParamsSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  variantId: Joi.number().integer().positive().required(),
});

export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// ─── Low Stock Query ──────────────────────────────────────────────────────────

export const lowStockQuerySchema = Joi.object({
  threshold: Joi.number().integer().min(0).max(10000).default(10),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// ─── Dashboard Query ──────────────────────────────────────────────────────────

export const inventoryDashboardQuerySchema = Joi.object({
  threshold: Joi.number().integer().min(0).max(10000).default(10),
});
