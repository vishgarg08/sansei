import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/prisma";
import { categorySelect } from "../types/catalog";
import { productSelect } from "../types/product";

type HomeProductRecord = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;

const toNullableNumber = (value: Prisma.Decimal | null): number | null =>
  value === null ? null : Number(value.toString());

const serializeHomeProduct = (product: HomeProductRecord) => {
  const basePrice = Number(product.basePrice.toString());
  const discountPrice = toNullableNumber(product.discountPrice);
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  const availableStock = product.variants.reduce(
    (sum, variant) => sum + Math.max(variant.stock - variant.reservedStock, 0),
    0
  );

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    brand: product.brand,
    basePrice,
    discountPrice,
    sellingPrice: discountPrice ?? basePrice,
    averageRating: Number(product.averageRating.toString()),
    reviewCount: product._count.reviews,
    totalSold: product.totalSold,
    totalViews: product.totalViews,
    totalStock,
    availableStock,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    category: product.category,
    subCategory: product.subCategory,
    images: product.images,
    variants: product.variants.map((variant) => ({
      ...variant,
      price: toNullableNumber(variant.price),
    })),
  };
};

const activeProductWhere: Prisma.ProductWhereInput = {
  deletedAt: null,
  isActive: true,
  category: {
    isActive: true,
  },
  OR: [{ subCategoryId: null }, { subCategory: { isActive: true } }],
};

export const getHomePageData = async () => {
  const now = new Date();

  const [banners, featuredProducts, bestSellers, newArrivals, trendingProducts, categories] =
    await Promise.all([
      prisma.banner.findMany({
        where: {
          isActive: true,
          OR: [{ startDate: null }, { startDate: { lte: now } }],
          AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
        },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.product.findMany({
        where: {
          ...activeProductWhere,
          isFeatured: true,
        },
        orderBy: [{ updatedAt: "desc" }],
        take: 12,
        select: productSelect,
      }),
      prisma.product.findMany({
        where: {
          ...activeProductWhere,
          isBestSeller: true,
        },
        orderBy: [{ totalSold: "desc" }, { updatedAt: "desc" }],
        take: 12,
        select: productSelect,
      }),
      prisma.product.findMany({
        where: {
          ...activeProductWhere,
          isNewArrival: true,
        },
        orderBy: [{ createdAt: "desc" }],
        take: 12,
        select: productSelect,
      }),
      prisma.product.findMany({
        where: activeProductWhere,
        orderBy: [{ totalViews: "desc" }, { totalSold: "desc" }],
        take: 12,
        select: productSelect,
      }),
      prisma.category.findMany({
        where: {
          isActive: true,
        },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        take: 12,
        select: categorySelect,
      }),
    ]);

  return {
    banners,
    featuredProducts: featuredProducts.map(serializeHomeProduct),
    bestSellers: bestSellers.map(serializeHomeProduct),
    newArrivals: newArrivals.map(serializeHomeProduct),
    trendingProducts: trendingProducts.map(serializeHomeProduct),
    categories,
  };
};