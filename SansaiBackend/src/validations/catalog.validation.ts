import Joi from "joi";

const optionalText = Joi.string().trim().max(1000).empty("").optional();
const optionalUrl = Joi.string().trim().max(2048).empty("").optional();

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  slug: Joi.string().trim().min(2).max(255).empty("").optional(),
  description: optionalText,
  image: optionalUrl,
  isActive: Joi.boolean().optional(),
  displayOrder: Joi.number().integer().min(0).optional(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).optional(),
  slug: Joi.string().trim().min(2).max(255).empty("").optional(),
  description: Joi.string().trim().max(1000).empty("").allow(null).optional(),
  image: Joi.string().trim().max(2048).empty("").allow(null).optional(),
  isActive: Joi.boolean().optional(),
  displayOrder: Joi.number().integer().min(0).optional(),
}).min(1);

export const createSubCategorySchema = Joi.object({
  categoryId: Joi.number().integer().positive().required(),
  name: Joi.string().trim().min(2).max(255).required(),
  slug: Joi.string().trim().min(2).max(255).empty("").optional(),
  description: optionalText,
  image: optionalUrl,
  isActive: Joi.boolean().optional(),
});

export const updateSubCategorySchema = Joi.object({
  categoryId: Joi.number().integer().positive().optional(),
  name: Joi.string().trim().min(2).max(255).optional(),
  slug: Joi.string().trim().min(2).max(255).empty("").optional(),
  description: Joi.string().trim().max(1000).empty("").allow(null).optional(),
  image: Joi.string().trim().max(2048).empty("").allow(null).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

export const categoryIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const categorySlugParamSchema = Joi.object({
  slug: Joi.string().trim().min(2).required(),
});

export const categorySubcategoryParamSchema = Joi.object({
  categoryId: Joi.number().integer().positive().required(),
});

export const subCategoryIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const subCategorySlugParamSchema = Joi.object({
  slug: Joi.string().trim().min(2).required(),
});

export const listSubCategoriesQuerySchema = Joi.object({
  categoryId: Joi.number().integer().positive().optional(),
});
