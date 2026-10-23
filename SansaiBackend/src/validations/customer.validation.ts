import Joi from "joi";

export const customerListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().allow("").optional(),
  status: Joi.string().valid("all", "active", "inactive").default("all"),
});

export const customerIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
