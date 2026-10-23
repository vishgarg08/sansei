import Joi from "joi";

// ─── Address Validations ───────────────────────────────────────────────────

export const createAddressSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be between 10 and 15 digits",
    }),
  addressLine1: Joi.string().trim().required(),
  addressLine2: Joi.string().trim().allow(null, "").optional(),
  city: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
  postalCode: Joi.string().trim().required(),
  country: Joi.string().trim().default("IN").optional(),
  isDefault: Joi.boolean().default(false).optional(),
});

export const updateAddressSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).optional(),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      "string.pattern.base": "Phone number must be between 10 and 15 digits",
    }),
  addressLine1: Joi.string().trim().optional(),
  addressLine2: Joi.string().trim().allow(null, "").optional(),
  city: Joi.string().trim().optional(),
  state: Joi.string().trim().optional(),
  postalCode: Joi.string().trim().optional(),
  country: Joi.string().trim().optional(),
  isDefault: Joi.boolean().optional(),
}).min(1);

export const addressIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
