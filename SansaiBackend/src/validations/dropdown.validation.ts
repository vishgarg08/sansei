import Joi from "joi";

export const categoriesDropdownQuerySchema = Joi.object({});

export const subCategoriesDropdownQuerySchema = Joi.object({
  categoryId: Joi.number().integer().positive().optional(),
});

export const productSizesColorsQuerySchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
});

export const productFormDataQuerySchema = Joi.object({
  categoryId: Joi.number().integer().positive().optional(),
});
