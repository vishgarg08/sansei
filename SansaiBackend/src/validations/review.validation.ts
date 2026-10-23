import Joi from "joi";

// ─── Params ───────────────────────────────────────────────────────────────────

export const reviewIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const productIdParamSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
});

// ─── Create Review ────────────────────────────────────────────────────────────

export const createReviewSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().min(5).max(1000).optional().allow("", null),
  images: Joi.array()
    .items(Joi.string().uri().trim().max(2048))
    .max(5)
    .optional(),
});

// ─── Update Review ────────────────────────────────────────────────────────────

export const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  comment: Joi.string().trim().min(5).max(1000).optional().allow("", null),
  images: Joi.array()
    .items(Joi.string().uri().trim().max(2048))
    .max(5)
    .optional(),
}).min(1);

// ─── Public Review List Query ─────────────────────────────────────────────────

export const productReviewsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  rating: Joi.number().integer().min(1).max(5).optional(),
  verified: Joi.boolean().optional(),
});

// ─── Admin Review List Query ──────────────────────────────────────────────────

export const adminReviewListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  productId: Joi.number().integer().positive().optional(),
  userId: Joi.number().integer().positive().optional(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  isApproved: Joi.boolean().optional(),
  verified: Joi.boolean().optional(),
});
