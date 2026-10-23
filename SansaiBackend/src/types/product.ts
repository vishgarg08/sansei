import { Prisma } from "@prisma/client";

export const productSelect = Prisma.validator<Prisma.ProductSelect>()({
  id: true,
  categoryId: true,
  subCategoryId: true,
  name: true,
  slug: true,
  shortDescription: true,
  description: true,
  fabricType: true,
  fitType: true,
  careInstructions: true,
  material: true,
  finish: true,
  dimensions: true,
  packQuantity: true,
  unitOfMeasure: true,
  brand: true,
  sku: true,
  basePrice: true,
  discountPrice: true,
  costPrice: true,
  weight: true,
  tags: true,
  seoTitle: true,
  seoDescription: true,
  seoKeywords: true,
  canonicalUrl: true,
  totalViews: true,
  totalSold: true,
  averageRating: true,
  isActive: true,
  isFeatured: true,
  isBestSeller: true,
  isNewArrival: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  subCategory: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  images: {
    orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
    select: {
      id: true,
      imageUrl: true,
      publicId: true,
      blurHash: true,
      altText: true,
      isPrimary: true,
      displayOrder: true,
      createdAt: true,
    },
  },
  videos: {
    orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
    select: {
      id: true,
      videoUrl: true,
      thumbnailUrl: true,
      publicId: true,
      title: true,
      displayOrder: true,
      createdAt: true,
    },
  },
  variants: {
    orderBy: [{ id: "asc" }],
    select: {
      id: true,
      size: true,
      color: true,
      sku: true,
      price: true,
      stock: true,
      reservedStock: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  _count: {
    select: {
      reviews: true,
    },
  },
});

export type ProductRecord = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;
