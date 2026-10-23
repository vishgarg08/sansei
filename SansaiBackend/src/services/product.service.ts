import { Prisma } from "@prisma/client";
import {
  deleteCloudinaryAssets,
  uploadProductImages as uploadImagesToCloudinary,
  uploadProductVideos as uploadVideosToCloudinary,
} from "./media.service";
import { prisma } from "../prisma/prisma";
import { DbClient } from "../types/prisma";
import { ProductRecord, productSelect } from "../types/product";
import { AppError } from "../utils/appError";

type ProductImageInput = {
  id?: number;
  imageUrl: string;
  publicId?: string | null;
  blurHash?: string | null;
  altText?: string;
  isPrimary?: boolean;
  displayOrder?: number;
};

type ProductVideoInput = {
  id?: number;
  videoUrl: string;
  thumbnailUrl?: string | null;
  publicId?: string | null;
  title?: string | null;
  displayOrder?: number;
};

type ProductVariantInput = {
  id?: number;
  size: string;
  color: string;
  sku: string;
  price?: number | null;
  stock?: number;
  reservedStock?: number;
};

type CreateProductInput = {
  categoryId: number;
  subCategoryId?: number | null;
  name: string;
  slug?: string;
  shortDescription?: string;
  description: string;
  fabricType?: string;
  fitType?: string;
  careInstructions?: string;
  material?: string;
  finish?: string;
  dimensions?: string;
  packQuantity?: number;
  unitOfMeasure?: string;
  brand?: string;
  sku: string;
  basePrice: number;
  discountPrice?: number | null;
  costPrice?: number | null;
  weight?: number | null;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  images?: ProductImageInput[];
  videos?: ProductVideoInput[];
  variants?: ProductVariantInput[];
};

type UpdateProductInput = Partial<CreateProductInput> & {
  removeImageIds?: number[];
  removeVariantIds?: number[];
};

type ProductSortKey =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc"
  | "best_selling"
  | "top_rated"
  | "popular"
  | "featured";

export type ListProductsQuery = {
  page: number;
  limit: number;
  search?: string;
  categoryId?: number;
  category?: string;
  subCategoryId?: number;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  sort?: ProductSortKey;
  sortBy: "createdAt" | "updatedAt" | "name" | "basePrice" | "totalSold";
  sortOrder: "asc" | "desc";
};

const publicReviewSelect = Prisma.validator<Prisma.ReviewSelect>()({
  id: true,
  rating: true,
  comment: true,
  images: true,
  verified: true,
  helpful: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      profileImage: true,
    },
  },
});

type PublicReviewRecord = Prisma.ReviewGetPayload<{
  select: typeof publicReviewSelect;
}>;

const toNullableNumber = (value: Prisma.Decimal | null): number | null =>
  value === null ? null : Number(value.toString());

const trimRequired = (value: string): string => value.trim();

const trimNullable = (
  value: string | null | undefined
): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const normalizeTags = (
  tags: string[] | null | undefined
): string | null | undefined => {
  if (tags === undefined) {
    return undefined;
  }

  if (tags === null) {
    return null;
  }

  const cleanedTags = tags.map((tag) => tag.trim()).filter(Boolean);
  return cleanedTags.length > 0 ? cleanedTags.join(", ") : null;
};

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const assertPriceRelationship = (
  basePrice: number,
  discountPrice: number | null | undefined
): void => {
  if (discountPrice !== null && discountPrice !== undefined && discountPrice > basePrice) {
    throw new AppError("Discount price cannot be greater than base price", 400);
  }
};

const normalizeImagesForCreate = (
  images: ProductImageInput[] | undefined
): ProductImageInput[] => {
  if (!images || images.length === 0) {
    return [];
  }

  const primaryImages = images.filter((image) => image.isPrimary);

  if (primaryImages.length > 1) {
    throw new AppError("Only one product image can be marked as primary", 400);
  }

  const normalizedImages = images.map((image, index) => ({
    imageUrl: image.imageUrl,
    publicId: image.publicId,
    blurHash: image.blurHash,
    altText: image.altText,
    displayOrder: image.displayOrder,
    // Ignore incoming ids on create. New products always create fresh ProductImage rows.
    isPrimary: primaryImages.length === 1 ? Boolean(image.isPrimary) : index === 0,
  }));

  return normalizedImages;
};

const assertUniqueVariantPayload = (variants: ProductVariantInput[] | undefined): void => {
  if (!variants || variants.length === 0) {
    return;
  }

  const seenSkus = new Set<string>();
  const seenCombinations = new Set<string>();

  for (const variant of variants) {
    const normalizedSku = trimRequired(variant.sku).toLowerCase();
    const normalizedCombination = `${trimRequired(variant.size).toLowerCase()}::${trimRequired(
      variant.color
    ).toLowerCase()}`;

    if (seenSkus.has(normalizedSku)) {
      throw new AppError("Variant SKU values must be unique within the request", 400);
    }

    if (seenCombinations.has(normalizedCombination)) {
      throw new AppError("Variant size and color combinations must be unique", 400);
    }

    seenSkus.add(normalizedSku);
    seenCombinations.add(normalizedCombination);
  }
};

const buildUniqueSlug = async (
  sourceValue: string,
  excludeProductId?: number
): Promise<string> => {
  const baseSlug = slugify(sourceValue);

  if (!baseSlug) {
    throw new AppError("Unable to generate a valid product slug", 400);
  }

  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        slug: candidate,
        ...(excludeProductId
          ? {
              NOT: {
                id: excludeProductId,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    if (!existingProduct) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

const ensureCategoryHierarchy = async (
  categoryId: number,
  subCategoryId?: number | null
): Promise<void> => {
  const [category, subCategory] = await Promise.all([
    prisma.category.findFirst({
      where: {
        id: categoryId,
        isActive: true,
      },
      select: { id: true },
    }),
    subCategoryId
      ? prisma.subCategory.findFirst({
          where: {
            id: subCategoryId,
            isActive: true,
          },
          select: { id: true, categoryId: true },
        })
      : Promise.resolve(null),
  ]);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (subCategoryId && !subCategory) {
    throw new AppError("Subcategory not found", 404);
  }

  if (subCategory && subCategory.categoryId !== categoryId) {
    throw new AppError("Subcategory does not belong to the provided category", 400);
  }
};

const activeCatalogWhere: Prisma.ProductWhereInput = {
  category: {
    isActive: true,
  },
  OR: [{ subCategoryId: null }, { subCategory: { isActive: true } }],
};

const getProductOrThrow = async (
  productId: number,
  includeInactive = false
): Promise<ProductRecord> => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      deletedAt: null,
      ...(includeInactive ? {} : { isActive: true, ...activeCatalogWhere }),
    },
    select: productSelect,
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

const getPublicProductOrThrow = async (identifier: string): Promise<ProductRecord> => {
  const normalizedIdentifier = trimRequired(identifier);
  const product = /^\d+$/.test(normalizedIdentifier)
    ? await prisma.product.findFirst({
        where: {
          id: Number(normalizedIdentifier),
          deletedAt: null,
          isActive: true,
          ...activeCatalogWhere,
        },
        select: productSelect,
      })
    : await prisma.product.findFirst({
        where: {
          slug: normalizedIdentifier,
          deletedAt: null,
          isActive: true,
          ...activeCatalogWhere,
        },
        select: productSelect,
      });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

const getProductAdminSnapshot = async (productId: number) => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      deletedAt: null,
    },
    select: {
      id: true,
      categoryId: true,
      subCategoryId: true,
      name: true,
      slug: true,
      sku: true,
      basePrice: true,
      discountPrice: true,
      images: {
        select: {
          id: true,
          isPrimary: true,
          publicId: true,
        },
      },
      variants: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

const buildStockSummary = (variants: ProductRecord["variants"]) => {
  const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
  const totalReservedStock = variants.reduce((sum, variant) => sum + variant.reservedStock, 0);
  const availableStock = variants.reduce(
    (sum, variant) => sum + Math.max(variant.stock - variant.reservedStock, 0),
    0
  );

  return {
    totalStock,
    totalReservedStock,
    availableStock,
    inStock: availableStock > 0,
    variants: variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      reservedStock: variant.reservedStock,
      availableStock: Math.max(variant.stock - variant.reservedStock, 0),
      price: toNullableNumber(variant.price),
    })),
  };
};

const serializeProduct = (product: ProductRecord) => {
  const stock = buildStockSummary(product.variants);
  const basePrice = Number(product.basePrice.toString());
  const discountPrice = toNullableNumber(product.discountPrice);

  return {
    id: product.id,
    categoryId: product.categoryId,
    subCategoryId: product.subCategoryId,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    fabricType: product.fabricType,
    fitType: product.fitType,
    careInstructions: product.careInstructions,
    material: product.material,
    finish: product.finish,
    dimensions: product.dimensions,
    packQuantity: product.packQuantity,
    unitOfMeasure: product.unitOfMeasure,
    brand: product.brand,
    sku: product.sku,
    basePrice,
    discountPrice,
    sellingPrice: discountPrice ?? basePrice,
    costPrice: toNullableNumber(product.costPrice),
    weight: toNullableNumber(product.weight),
    tags: product.tags ? product.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    seoKeywords: product.seoKeywords,
    canonicalUrl: product.canonicalUrl,
    totalViews: product.totalViews,
    totalSold: product.totalSold,
    averageRating: Number(product.averageRating.toString()),
    reviewCount: product._count.reviews,
    totalStock: stock.totalStock,
    totalReservedStock: stock.totalReservedStock,
    availableStock: stock.availableStock,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    deletedAt: product.deletedAt,
    category: product.category,
    subCategory: product.subCategory,
    images: product.images.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      publicId: image.publicId,
      blurHash: image.blurHash,
      altText: image.altText,
      isPrimary: image.isPrimary,
      displayOrder: image.displayOrder,
      createdAt: image.createdAt,
    })),
    videos: product.videos.map((video) => ({
      id: video.id,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      publicId: video.publicId,
      title: video.title,
      displayOrder: video.displayOrder,
      createdAt: video.createdAt,
    })),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: toNullableNumber(variant.price),
    })),
  };
};

const serializeReview = (review: PublicReviewRecord) => ({
  id: review.id,
  rating: review.rating,
  comment: review.comment,
  images: review.images
    ? review.images
        .split(",")
        .map((image) => image.trim())
        .filter(Boolean)
    : [],
  verified: review.verified,
  helpful: review.helpful,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
  user: review.user,
});

const mapUniqueConstraintError = (error: Prisma.PrismaClientKnownRequestError): never => {
  const target = Array.isArray(error.meta?.target) ? error.meta?.target.join(", ") : "";

  if (target.includes("slug")) {
    throw new AppError("A product with this slug already exists", 409);
  }

  if (target.includes("sku")) {
    throw new AppError("A product or variant with this SKU already exists", 409);
  }

  if (target.includes("productId, size, color")) {
    throw new AppError("Variant size and color combination already exists", 409);
  }

  throw new AppError("A record with the provided unique values already exists", 409);
};

const handlePrismaWriteError = (error: unknown): never => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      mapUniqueConstraintError(error);
    }

    if (error.code === "P2003") {
      throw new AppError("Unable to delete variant because it is already referenced", 400);
    }
  }

  throw error;
};

const assertVariantRemovalsAreSafe = async (
  client: DbClient,
  productId: number,
  variantIds: number[]
): Promise<void> => {
  if (variantIds.length === 0) {
    return;
  }

  const [cartCount, orderItemCount, inventoryLogCount] = await Promise.all([
    client.cart.count({
      where: {
        productId,
        variantId: {
          in: variantIds,
        },
      },
    }),
    client.orderItem.count({
      where: {
        productId,
        variantId: {
          in: variantIds,
        },
      },
    }),
    client.inventoryLog.count({
      where: {
        productId,
        variantId: {
          in: variantIds,
        },
      },
    }),
  ]);

  if (cartCount > 0 || orderItemCount > 0 || inventoryLogCount > 0) {
    throw new AppError(
      "One or more variants cannot be removed because they are already referenced",
      400
    );
  }
};

const ensurePrimaryImage = async (client: DbClient, productId: number): Promise<void> => {
  const images = await client.productImage.findMany({
    where: { productId },
    orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
    select: {
      id: true,
      isPrimary: true,
    },
  });

  if (images.length === 0 || images.some((image) => image.isPrimary)) {
    return;
  }

  await client.productImage.update({
    where: { id: images[0].id },
    data: { isPrimary: true },
  });
};

const syncProductImages = async (
  client: DbClient,
  productId: number,
  images: ProductImageInput[] | undefined,
  removeImageIds: number[] | undefined
): Promise<void> => {
  if (images && images.filter((image) => image.isPrimary).length > 1) {
    throw new AppError("Only one product image can be marked as primary", 400);
  }

  if (images?.some((image) => image.id && removeImageIds?.includes(image.id))) {
    throw new AppError("The same image cannot be updated and removed together", 400);
  }

  if (removeImageIds && removeImageIds.length > 0) {
    await client.productImage.deleteMany({
      where: {
        productId,
        id: {
          in: removeImageIds,
        },
      },
    });
  }

  if (!images || images.length === 0) {
    await ensurePrimaryImage(client, productId);
    return;
  }

  if (images.some((image) => image.isPrimary)) {
    await client.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });
  }

  for (const image of images) {
    const baseData = {
      imageUrl: trimRequired(image.imageUrl),
      altText: trimNullable(image.altText) ?? null,
      isPrimary: Boolean(image.isPrimary),
      displayOrder: image.displayOrder ?? 0,
    };

    if (image.id) {
      const result = await client.productImage.updateMany({
        where: {
          id: image.id,
          productId,
        },
        data: {
          ...baseData,
          ...(image.publicId !== undefined ? { publicId: trimNullable(image.publicId) ?? null } : {}),
          ...(image.blurHash !== undefined ? { blurHash: trimNullable(image.blurHash) ?? null } : {}),
        },
      });

      if (result.count === 0) {
        throw new AppError(`Product image ${image.id} not found`, 404);
      }

      continue;
    }

    await client.productImage.create({
      data: {
        productId,
        ...baseData,
        publicId: trimNullable(image.publicId) ?? null,
        blurHash: trimNullable(image.blurHash) ?? null,
      },
    });
  }

  await ensurePrimaryImage(client, productId);
};

const syncProductVariants = async (
  client: DbClient,
  productId: number,
  variants: ProductVariantInput[] | undefined,
  removeVariantIds: number[] | undefined
): Promise<void> => {
  assertUniqueVariantPayload(variants);

  if (variants?.some((variant) => variant.id && removeVariantIds?.includes(variant.id))) {
    throw new AppError("The same variant cannot be updated and removed together", 400);
  }

  if (removeVariantIds && removeVariantIds.length > 0) {
    await assertVariantRemovalsAreSafe(client, productId, removeVariantIds);

    await client.productVariant.deleteMany({
      where: {
        productId,
        id: {
          in: removeVariantIds,
        },
      },
    });
  }

  if (!variants || variants.length === 0) {
    return;
  }

  for (const variant of variants) {
    const data = {
      size: trimRequired(variant.size),
      color: trimRequired(variant.color),
      sku: trimRequired(variant.sku),
      price: variant.price ?? null,
      stock: variant.stock ?? 0,
      reservedStock: variant.reservedStock ?? 0,
    };

    if (data.reservedStock > data.stock) {
      throw new AppError("Reserved stock cannot be greater than stock", 400);
    }

    if (variant.id) {
      const result = await client.productVariant.updateMany({
        where: {
          id: variant.id,
          productId,
        },
        data,
      });

      if (result.count === 0) {
        throw new AppError(`Product variant ${variant.id} not found`, 404);
      }

      continue;
    }

    await client.productVariant.create({
      data: {
        productId,
        ...data,
      },
    });
  }
};

const collectImagePublicIdsForCleanup = (
  existingImages: Array<{ id: number; publicId: string | null }>,
  input: UpdateProductInput
): string[] => {
  const publicIds = new Set<string>();
  const imageMap = new Map(existingImages.map((image) => [image.id, image.publicId]));

  for (const imageId of input.removeImageIds ?? []) {
    const publicId = imageMap.get(imageId);
    if (publicId) {
      publicIds.add(publicId);
    }
  }

  for (const image of input.images ?? []) {
    if (!image.id || image.publicId === undefined) {
      continue;
    }

    const existingPublicId = imageMap.get(image.id);
    const nextPublicId = trimNullable(image.publicId) ?? null;

    if (existingPublicId && nextPublicId !== existingPublicId) {
      publicIds.add(existingPublicId);
    }
  }

  return [...publicIds];
};

const buildPriceFilter = (
  minPrice: number | undefined,
  maxPrice: number | undefined
): Prisma.ProductWhereInput | undefined => {
  if (minPrice === undefined && maxPrice === undefined) {
    return undefined;
  }

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new AppError("Minimum price cannot be greater than maximum price", 400);
  }

  const priceFilter = {
    ...(minPrice !== undefined ? { gte: minPrice } : {}),
    ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
  };

  return {
    OR: [
      {
        discountPrice: {
          not: null,
          ...priceFilter,
        },
      },
      {
        discountPrice: null,
        basePrice: priceFilter,
      },
    ],
  };
};

const resolveCategoryFilters = async (query: ListProductsQuery) => {
  let resolvedCategoryId = query.categoryId;
  let resolvedSubCategoryId = query.subCategoryId;

  if (!resolvedCategoryId && query.category) {
    const category = await prisma.category.findFirst({
      where: {
        isActive: true,
        OR: [
          { slug: trimRequired(query.category) },
          { name: { equals: trimRequired(query.category), mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      // Product listing is a public collection endpoint. An unknown filter
      // should behave like an empty collection, not an application error.
      return {
        categoryId: -1,
        subCategoryId: -1,
      };
    }

    resolvedCategoryId = category.id;
  }

  if (!resolvedSubCategoryId && query.subcategory) {
    const subCategory = await prisma.subCategory.findFirst({
      where: {
        isActive: true,
        OR: [
          { slug: trimRequired(query.subcategory) },
          { name: { equals: trimRequired(query.subcategory), mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        categoryId: true,
      },
    });

    if (!subCategory) {
      return {
        categoryId: resolvedCategoryId ?? -1,
        subCategoryId: -1,
      };
    }

    resolvedSubCategoryId = subCategory.id;

    if (!resolvedCategoryId) {
      resolvedCategoryId = subCategory.categoryId;
    } else if (resolvedCategoryId !== subCategory.categoryId) {
      throw new AppError("Subcategory does not belong to the provided category", 400);
    }
  }

  return {
    categoryId: resolvedCategoryId,
    subCategoryId: resolvedSubCategoryId,
  };
};

const resolveBooleanFilter = (
  modernValue: boolean | undefined,
  legacyValue: boolean | undefined
): boolean | undefined => modernValue ?? legacyValue;

const resolveSort = (
  query: ListProductsQuery
): Prisma.ProductOrderByWithRelationInput[] => {
  const sort = query.sort;

  if (sort) {
    switch (sort) {
      case "newest":
        return [{ createdAt: "desc" }];
      case "oldest":
        return [{ createdAt: "asc" }];
      case "price_asc":
        return [{ basePrice: "asc" }];
      case "price_desc":
        return [{ basePrice: "desc" }];
      case "name_asc":
        return [{ name: "asc" }];
      case "name_desc":
        return [{ name: "desc" }];
      case "best_selling":
        return [{ totalSold: "desc" }, { createdAt: "desc" }];
      case "top_rated":
        return [{ averageRating: "desc" }, { totalSold: "desc" }];
      case "popular":
        return [{ totalViews: "desc" }, { createdAt: "desc" }];
      case "featured":
        return [{ isFeatured: "desc" }, { createdAt: "desc" }];
    }
  }

  return [{ [query.sortBy]: query.sortOrder }];
};

export const createProduct = async (input: CreateProductInput) => {
  assertPriceRelationship(input.basePrice, input.discountPrice);
  assertUniqueVariantPayload(input.variants);

  const productSlug = await buildUniqueSlug(input.slug || input.name);
  const images = normalizeImagesForCreate(input.images);

  await ensureCategoryHierarchy(input.categoryId, input.subCategoryId);

  try {
    const product = await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          categoryId: input.categoryId,
          subCategoryId: input.subCategoryId ?? null,
          name: trimRequired(input.name),
          slug: productSlug,
          shortDescription: trimNullable(input.shortDescription) ?? null,
          description: trimRequired(input.description),
          fabricType: trimNullable(input.fabricType) ?? null,
          fitType: trimNullable(input.fitType) ?? null,
          careInstructions: trimNullable(input.careInstructions) ?? null,
          material: trimNullable(input.material) ?? null,
          finish: trimNullable(input.finish) ?? null,
          dimensions: trimNullable(input.dimensions) ?? null,
          packQuantity: input.packQuantity ?? 1,
          unitOfMeasure: trimNullable(input.unitOfMeasure) ?? "piece",
          brand: trimNullable(input.brand) ?? null,
          sku: trimRequired(input.sku),
          basePrice: input.basePrice,
          discountPrice: input.discountPrice ?? null,
          costPrice: input.costPrice ?? null,
          weight: input.weight ?? null,
          tags: normalizeTags(input.tags) ?? null,
          seoTitle: trimNullable(input.seoTitle) ?? null,
          seoDescription: trimNullable(input.seoDescription) ?? null,
          seoKeywords: trimNullable(input.seoKeywords) ?? null,
          canonicalUrl: trimNullable(input.canonicalUrl) ?? null,
          isActive: input.isActive ?? true,
          isFeatured: input.isFeatured ?? false,
          isBestSeller: input.isBestSeller ?? false,
          isNewArrival: input.isNewArrival ?? false,
          videos: input.videos?.length
            ? {
                create: input.videos.map((video, index) => ({
                  videoUrl: trimRequired(video.videoUrl),
                  thumbnailUrl: trimNullable(video.thumbnailUrl) ?? null,
                  publicId: trimNullable(video.publicId) ?? null,
                  title: trimNullable(video.title) ?? null,
                  displayOrder: video.displayOrder ?? index,
                })),
              }
            : undefined,
        },
      });

      await syncProductImages(tx, createdProduct.id, images, undefined);
      await syncProductVariants(tx, createdProduct.id, input.variants, undefined);

      return tx.product.findUniqueOrThrow({
        where: { id: createdProduct.id },
        select: productSelect,
      });
    });

    return serializeProduct(product);
  } catch (error) {
    handlePrismaWriteError(error);
  }
};

export const updateProduct = async (productId: number, input: UpdateProductInput) => {
  const existingProduct = await getProductAdminSnapshot(productId);
  const publicIdsToDelete = collectImagePublicIdsForCleanup(existingProduct.images, input);

  const finalName = input.name ? trimRequired(input.name) : existingProduct.name;
  const finalCategoryId = input.categoryId ?? existingProduct.categoryId;
  const finalSubCategoryId =
    input.subCategoryId !== undefined ? input.subCategoryId : existingProduct.subCategoryId;
  const finalBasePrice = input.basePrice ?? Number(existingProduct.basePrice.toString());
  const finalDiscountPrice =
    input.discountPrice !== undefined
      ? input.discountPrice
      : toNullableNumber(existingProduct.discountPrice);

  assertPriceRelationship(finalBasePrice, finalDiscountPrice);
  await ensureCategoryHierarchy(finalCategoryId, finalSubCategoryId);

  const nextSlug =
    input.slug !== undefined || input.name !== undefined
      ? await buildUniqueSlug(input.slug || finalName, productId)
      : undefined;

  try {
    const product = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          categoryId: finalCategoryId,
          subCategoryId: finalSubCategoryId ?? null,
          name: input.name !== undefined ? finalName : undefined,
          slug: nextSlug,
          shortDescription:
            input.shortDescription !== undefined
              ? trimNullable(input.shortDescription) ?? null
              : undefined,
          description:
            input.description !== undefined ? trimRequired(input.description) : undefined,
          fabricType:
            input.fabricType !== undefined ? trimNullable(input.fabricType) ?? null : undefined,
          fitType: input.fitType !== undefined ? trimNullable(input.fitType) ?? null : undefined,
          careInstructions:
            input.careInstructions !== undefined
              ? trimNullable(input.careInstructions) ?? null
              : undefined,
          material:
            input.material !== undefined ? trimNullable(input.material) ?? null : undefined,
          finish: input.finish !== undefined ? trimNullable(input.finish) ?? null : undefined,
          dimensions:
            input.dimensions !== undefined ? trimNullable(input.dimensions) ?? null : undefined,
          packQuantity: input.packQuantity,
          unitOfMeasure:
            input.unitOfMeasure !== undefined
              ? trimNullable(input.unitOfMeasure) ?? null
              : undefined,
          brand: input.brand !== undefined ? trimNullable(input.brand) ?? null : undefined,
          sku: input.sku !== undefined ? trimRequired(input.sku) : undefined,
          basePrice: input.basePrice,
          discountPrice:
            input.discountPrice !== undefined ? input.discountPrice ?? null : undefined,
          costPrice: input.costPrice !== undefined ? input.costPrice ?? null : undefined,
          weight: input.weight !== undefined ? input.weight ?? null : undefined,
          tags: input.tags !== undefined ? normalizeTags(input.tags) ?? null : undefined,
          seoTitle:
            input.seoTitle !== undefined ? trimNullable(input.seoTitle) ?? null : undefined,
          seoDescription:
            input.seoDescription !== undefined
              ? trimNullable(input.seoDescription) ?? null
              : undefined,
          seoKeywords:
            input.seoKeywords !== undefined
              ? trimNullable(input.seoKeywords) ?? null
              : undefined,
          canonicalUrl:
            input.canonicalUrl !== undefined
              ? trimNullable(input.canonicalUrl) ?? null
              : undefined,
          isActive: input.isActive,
          isFeatured: input.isFeatured,
          isBestSeller: input.isBestSeller,
          isNewArrival: input.isNewArrival,
        },
      });

      await syncProductImages(tx, productId, input.images, input.removeImageIds);
      if (input.videos !== undefined) {
        await tx.productVideo.deleteMany({ where: { productId } });
        if (input.videos.length > 0) {
          await tx.productVideo.createMany({
            data: input.videos.map((video, index) => ({
              productId,
              videoUrl: trimRequired(video.videoUrl),
              thumbnailUrl: trimNullable(video.thumbnailUrl) ?? null,
              publicId: trimNullable(video.publicId) ?? null,
              title: trimNullable(video.title) ?? null,
              displayOrder: video.displayOrder ?? index,
            })),
          });
        }
      }
      await syncProductVariants(tx, productId, input.variants, input.removeVariantIds);

      return tx.product.findUniqueOrThrow({
        where: { id: productId },
        select: productSelect,
      });
    });

    await deleteCloudinaryAssets(publicIdsToDelete);
    return serializeProduct(product);
  } catch (error) {
    handlePrismaWriteError(error);
  }
};

export const saveUploadedProductImages = async (
  productId: number,
  files: Express.Multer.File[]
) => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      deletedAt: null,
    },
    select: {
      id: true,
      images: {
        orderBy: [{ displayOrder: "desc" }, { id: "desc" }],
        select: {
          id: true,
          isPrimary: true,
          displayOrder: true,
        },
      },
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const uploads = await uploadImagesToCloudinary(files);
  const hasPrimaryImage = product.images.some((image) => image.isPrimary);
  const nextDisplayOrder = product.images.length > 0 ? product.images[0].displayOrder + 1 : 0;

  try {
    const createdImages = await prisma.$transaction(async (tx) => {
      const created = [];

      for (const [index, upload] of uploads.entries()) {
        const image = await tx.productImage.create({
          data: {
            productId,
            imageUrl: upload.imageUrl,
            publicId: upload.publicId,
            blurHash: null,
            altText: null,
            isPrimary: !hasPrimaryImage && index === 0,
            displayOrder: nextDisplayOrder + index,
          },
          select: {
            id: true,
            productId: true,
            imageUrl: true,
            publicId: true,
            blurHash: true,
            altText: true,
            isPrimary: true,
            displayOrder: true,
            createdAt: true,
          },
        });

        created.push(image);
      }

      return created;
    });

    return createdImages;
  } catch (error) {
    await deleteCloudinaryAssets(uploads.map((upload) => upload.publicId));
    throw error;
  }
};

export const saveUploadedProductVideos = async (
  productId: number,
  files: Express.Multer.File[]
) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    select: {
      id: true,
      videos: {
        orderBy: [{ displayOrder: "desc" }, { id: "desc" }],
        take: 1,
        select: { displayOrder: true },
      },
    },
  });
  if (!product) throw new AppError("Product not found", 404);

  const uploads = await uploadVideosToCloudinary(files);
  const nextDisplayOrder = product.videos[0]?.displayOrder !== undefined
    ? product.videos[0].displayOrder + 1
    : 0;

  return prisma.$transaction(async (tx) => {
    const created = [];
    for (const [index, upload] of uploads.entries()) {
      created.push(
        await tx.productVideo.create({
          data: {
            productId,
            videoUrl: upload.videoUrl,
            publicId: upload.publicId,
            title: upload.originalName.replace(/\.[^/.]+$/, ""),
            displayOrder: nextDisplayOrder + index,
          },
        })
      );
    }
    return created;
  });
};

export const saveProductImageUrls = async (
  productId: number,
  images: ProductImageInput[]
) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    select: {
      id: true,
      images: {
        orderBy: [{ displayOrder: "desc" }, { id: "desc" }],
        select: { id: true, isPrimary: true, displayOrder: true },
      },
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const hasPrimaryImage = product.images.some((image) => image.isPrimary);
  const nextDisplayOrder = product.images.length > 0 ? product.images[0].displayOrder + 1 : 0;

  return prisma.$transaction(async (tx) => {
    const created = [];

    for (const [index, image] of images.entries()) {
      created.push(
        await tx.productImage.create({
          data: {
            productId,
            imageUrl: trimRequired(image.imageUrl),
            publicId: null,
            blurHash: null,
            altText: trimNullable(image.altText) ?? null,
            isPrimary: !hasPrimaryImage && index === 0,
            displayOrder: nextDisplayOrder + index,
          },
          select: {
            id: true,
            productId: true,
            imageUrl: true,
            publicId: true,
            blurHash: true,
            altText: true,
            isPrimary: true,
            displayOrder: true,
            createdAt: true,
          },
        })
      );
    }

    return created;
  });
};

export const getProductById = async (productId: number) => {
  const product = await getProductOrThrow(productId);
  return serializeProduct(product);
};

export const getProductBySlug = async (slug: string) => getProductDetails(slug);

export const getProductDetails = async (identifier: string) => {
  const product = await getPublicProductOrThrow(identifier);

  await prisma.product.update({
    where: { id: product.id },
    data: {
      totalViews: {
        increment: 1,
      },
    },
  });

  const [approvedReviews, approvedReviewCount, relatedProducts] = await Promise.all([
    prisma.review.findMany({
      where: {
        productId: product.id,
        isApproved: true,
      },
      orderBy: [{ createdAt: "desc" }],
      take: 10,
      select: publicReviewSelect,
    }),
    prisma.review.count({
      where: {
        productId: product.id,
        isApproved: true,
      },
    }),
    prisma.product.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        id: {
          not: product.id,
        },
        categoryId: product.categoryId,
        ...(product.subCategoryId ? { subCategoryId: product.subCategoryId } : {}),
        ...activeCatalogWhere,
      },
      orderBy: [
        { isFeatured: "desc" },
        { isBestSeller: "desc" },
        { isNewArrival: "desc" },
        { totalSold: "desc" },
      ],
      take: 8,
      select: productSelect,
    }),
  ]);

  const serializedProduct = serializeProduct(product);
  const stock = buildStockSummary(product.variants);

  return {
    product: {
      ...serializedProduct,
      totalViews: serializedProduct.totalViews + 1,
    },
    images: serializedProduct.images,
    variants: serializedProduct.variants,
    stock,
    reviews: approvedReviews.map(serializeReview),
    reviewCount: approvedReviewCount,
    averageRating: serializedProduct.averageRating,
    relatedProducts: relatedProducts.map(serializeProduct),
  };
};

export const listProducts = async (query: ListProductsQuery) => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const resolvedFilters = await resolveCategoryFilters(query);
  const isFeatured = resolveBooleanFilter(query.featured, query.isFeatured);
  const isBestSeller = resolveBooleanFilter(query.bestseller, query.isBestSeller);
  const isNewArrival = resolveBooleanFilter(query.newArrival, query.isNewArrival);
  const priceWhere = buildPriceFilter(query.minPrice, query.maxPrice);

  const searchWhere: Prisma.ProductWhereInput | undefined = query.search
    ? {
        OR: [
          { name: { contains: query.search, mode: "insensitive" } },
          { slug: { contains: query.search, mode: "insensitive" } },
          { sku: { contains: query.search, mode: "insensitive" } },
          { brand: { contains: query.search, mode: "insensitive" } },
          { description: { contains: query.search, mode: "insensitive" } },
          { shortDescription: { contains: query.search, mode: "insensitive" } },
          { tags: { contains: query.search, mode: "insensitive" } },
        ],
      }
    : undefined;

  const variantWhere: Prisma.ProductWhereInput | undefined =
    query.size || query.color
      ? {
          variants: {
            some: {
              ...(query.size
                ? { size: { equals: trimRequired(query.size), mode: "insensitive" } }
                : {}),
              ...(query.color
                ? { color: { equals: trimRequired(query.color), mode: "insensitive" } }
                : {}),
              stock: {
                gt: 0,
              },
            },
          },
        }
      : undefined;

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    isActive: true,
    AND: [
      activeCatalogWhere,
      ...(searchWhere ? [searchWhere] : []),
      ...(priceWhere ? [priceWhere] : []),
      ...(variantWhere ? [variantWhere] : []),
    ],
    ...(resolvedFilters.categoryId ? { categoryId: resolvedFilters.categoryId } : {}),
    ...(resolvedFilters.subCategoryId ? { subCategoryId: resolvedFilters.subCategoryId } : {}),
    ...(isFeatured !== undefined ? { isFeatured } : {}),
    ...(isBestSeller !== undefined ? { isBestSeller } : {}),
    ...(isNewArrival !== undefined ? { isNewArrival } : {}),
  };

  const orderBy = resolveSort(query);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: productSelect,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: products.map(serializeProduct),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: skip + products.length < total,
      hasPreviousPage: page > 1,
    },
  };
};

export const deleteProduct = async (productId: number): Promise<void> => {
  const existingProduct = await getProductAdminSnapshot(productId);

  await prisma.product.update({
    where: { id: productId },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });

  await deleteCloudinaryAssets(
    existingProduct.images
      .map((image) => image.publicId)
      .filter((publicId): publicId is string => Boolean(publicId))
  );
};
