import Joi from "joi";

const optionalText = Joi.string().trim().max(5000).empty("").optional();
const optionalUrl = Joi.string().trim().max(2048).empty("").optional();
const money = Joi.number().min(0).precision(2);

const productImageSchema = Joi.object({
  id: Joi.number().integer().positive().optional(),
  imageUrl: Joi.string().trim().max(2048).required(),
  publicId: Joi.string().trim().max(255).allow(null).empty("").optional(),
  blurHash: Joi.string().trim().max(255).allow(null).empty("").optional(),
  altText: Joi.string().trim().max(255).empty("").optional(),
  isPrimary: Joi.boolean().optional(),
  displayOrder: Joi.number().integer().min(0).optional(),
});

const productVariantSchema = Joi.object({
  id: Joi.number().integer().positive().optional(),
  size: Joi.string().trim().max(100).required(),
  color: Joi.string().trim().max(100).required(),
  sku: Joi.string().trim().max(100).required(),
  price: money.allow(null).optional(),
  stock: Joi.number().integer().min(0).optional(),
  reservedStock: Joi.number().integer().min(0).optional(),
});

const productVideoSchema = Joi.object({
  id: Joi.number().integer().positive().optional(),
  videoUrl: Joi.string().uri({ scheme: ["http", "https"] }).max(2048).required(),
  thumbnailUrl: Joi.string().uri({ scheme: ["http", "https"] }).max(2048).allow(null, "").optional(),
  publicId: Joi.string().trim().max(255).allow(null, "").optional(),
  title: Joi.string().trim().max(255).allow(null, "").optional(),
  displayOrder: Joi.number().integer().min(0).optional(),
});

export const createProductSchema = Joi.object({
  categoryId: Joi.number().integer().positive().required(),
  subCategoryId: Joi.number().integer().positive().allow(null).optional(),
  name: Joi.string().trim().min(2).max(255).required(),
  slug: Joi.string().trim().min(2).max(255).empty("").optional(),
  shortDescription: Joi.string().trim().max(500).empty("").optional(),
  description: Joi.string().trim().min(10).max(5000).required(),
  fabricType: optionalText,
  fitType: optionalText,
  careInstructions: optionalText,
  material: Joi.string().trim().max(255).empty("").optional(),
  finish: Joi.string().trim().max(255).empty("").optional(),
  dimensions: Joi.string().trim().max(255).empty("").optional(),
  packQuantity: Joi.number().integer().min(1).max(100000).optional(),
  unitOfMeasure: Joi.string().trim().max(50).empty("").optional(),
  brand: Joi.string().trim().max(255).empty("").optional(),
  sku: Joi.string().trim().min(2).max(100).required(),
  basePrice: money.required(),
  discountPrice: money.allow(null).optional(),
  costPrice: money.allow(null).optional(),
  weight: money.allow(null).optional(),
  tags: Joi.array().items(Joi.string().trim().max(100)).max(25).optional(),
  seoTitle: Joi.string().trim().max(255).empty("").optional(),
  seoDescription: Joi.string().trim().max(500).empty("").optional(),
  seoKeywords: Joi.string().trim().max(500).empty("").optional(),
  canonicalUrl: optionalUrl,
  isActive: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  isBestSeller: Joi.boolean().optional(),
  isNewArrival: Joi.boolean().optional(),
  images: Joi.array().items(productImageSchema).max(20).optional(),
  videos: Joi.array().items(productVideoSchema).max(10).optional(),
  variants: Joi.array().items(productVariantSchema).max(100).optional(),
});

export const updateProductSchema = Joi.object({
  categoryId: Joi.number().integer().positive().optional(),
  subCategoryId: Joi.number().integer().positive().allow(null).optional(),
  name: Joi.string().trim().min(2).max(255).optional(),
  slug: Joi.string().trim().min(2).max(255).empty("").optional(),
  shortDescription: Joi.string().trim().max(500).empty("").allow(null).optional(),
  description: Joi.string().trim().min(10).max(5000).optional(),
  fabricType: optionalText.allow(null),
  fitType: optionalText.allow(null),
  careInstructions: optionalText.allow(null),
  material: Joi.string().trim().max(255).empty("").allow(null).optional(),
  finish: Joi.string().trim().max(255).empty("").allow(null).optional(),
  dimensions: Joi.string().trim().max(255).empty("").allow(null).optional(),
  packQuantity: Joi.number().integer().min(1).max(100000).optional(),
  unitOfMeasure: Joi.string().trim().max(50).empty("").allow(null).optional(),
  brand: Joi.string().trim().max(255).empty("").allow(null).optional(),
  sku: Joi.string().trim().min(2).max(100).optional(),
  basePrice: money.optional(),
  discountPrice: money.allow(null).optional(),
  costPrice: money.allow(null).optional(),
  weight: money.allow(null).optional(),
  tags: Joi.array().items(Joi.string().trim().max(100)).max(25).allow(null).optional(),
  seoTitle: Joi.string().trim().max(255).empty("").allow(null).optional(),
  seoDescription: Joi.string().trim().max(500).empty("").allow(null).optional(),
  seoKeywords: Joi.string().trim().max(500).empty("").allow(null).optional(),
  canonicalUrl: optionalUrl.allow(null),
  isActive: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  isBestSeller: Joi.boolean().optional(),
  isNewArrival: Joi.boolean().optional(),
  images: Joi.array().items(productImageSchema).max(20).optional(),
  videos: Joi.array().items(productVideoSchema).max(10).optional(),
  removeImageIds: Joi.array()
    .items(Joi.number().integer().positive())
    .unique()
    .max(20)
    .optional(),
  variants: Joi.array().items(productVariantSchema).max(100).optional(),
  removeVariantIds: Joi.array()
    .items(Joi.number().integer().positive())
    .unique()
    .max(100)
    .optional(),
}).min(1);

export const productIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const productIdentifierParamSchema = Joi.object({
  identifier: Joi.string().trim().min(1).required(),
});

export const productSlugParamSchema = Joi.object({
  slug: Joi.string().trim().min(2).required(),
});

export const listProductsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(255).empty("").optional(),
  categoryId: Joi.number().integer().positive().optional(),
  category: Joi.string().trim().max(255).optional(),
  subCategoryId: Joi.number().integer().positive().optional(),
  subcategory: Joi.string().trim().max(255).optional(),
  minPrice: money.optional(),
  maxPrice: money.optional(),
  size: Joi.string().trim().max(100).optional(),
  color: Joi.string().trim().max(100).optional(),
  featured: Joi.boolean().optional(),
  bestseller: Joi.boolean().optional(),
  newArrival: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  isBestSeller: Joi.boolean().optional(),
  isNewArrival: Joi.boolean().optional(),
  sort: Joi.string()
    .valid(
      "newest",
      "oldest",
      "price_asc",
      "price_desc",
      "name_asc",
      "name_desc",
      "best_selling",
      "top_rated",
      "popular",
      "featured"
    )
    .optional(),
  sortBy: Joi.string()
    .valid("createdAt", "updatedAt", "name", "basePrice", "totalSold")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

export const deleteUploadedImagesSchema = Joi.object({
  publicIds: Joi.array().items(Joi.string().trim().max(255)).min(1).max(20).required(),
});

export const uploadProductImagesSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
});

export const addProductImageUrlsSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  images: Joi.array().items(productImageSchema).min(1).max(20).required(),
});
