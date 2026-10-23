import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/prisma";
import { AppError } from "../utils/appError";

// ─── Prisma selects ─────────────────────────────────────────────────────────

const wishlistItemSelect = Prisma.validator<Prisma.WishlistSelect>()({
  id: true,
  userId: true,
  productId: true,
  createdAt: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      discountPrice: true,
      isActive: true,
      deletedAt: true,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      averageRating: true,
      images: {
        where: { isPrimary: true },
        select: { imageUrl: true },
        take: 1,
      },
      variants: {
        select: {
          stock: true,
          reservedStock: true,
        },
      },
    },
  },
});

type WishlistItemRecord = Prisma.WishlistGetPayload<{
  select: typeof wishlistItemSelect;
}>;

// ─── Serializer ─────────────────────────────────────────────────────────────

const serializeWishlistItem = (item: WishlistItemRecord) => {
  const totalStock = item.product.variants.reduce(
    (sum, v) => sum + (v.stock - v.reservedStock),
    0
  );

  return {
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    slug: item.product.slug,
    image: item.product.images[0]?.imageUrl ?? null,
    price: Number(item.product.basePrice),
    discountPrice: item.product.discountPrice
      ? Number(item.product.discountPrice)
      : null,
    sellingPrice: Number(
      item.product.discountPrice ?? item.product.basePrice
    ),
    averageRating: Number(item.product.averageRating),
    isActive: item.product.isActive,
    inStock: totalStock > 0,
    isFeatured: item.product.isFeatured,
    isBestSeller: item.product.isBestSeller,
    isNewArrival: item.product.isNewArrival,
    createdAt: item.createdAt,
  };
};

// ─── Service Methods ────────────────────────────────────────────────────────

export const toggleWishlist = async (userId: number, productId: number) => {
  // Validate product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, isActive: true, deletedAt: true },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (!product.isActive || product.deletedAt) {
    throw new AppError("Product is no longer available", 400);
  }

  // Check if already in wishlist → toggle (remove)
  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.wishlist.delete({
      where: { id: existing.id },
    });

    return { action: "removed" as const, productId };
  }

  // Add to wishlist
  const wishlistItem = await prisma.wishlist.create({
    data: { userId, productId },
    select: wishlistItemSelect,
  });

  return {
    action: "added" as const,
    productId,
    item: serializeWishlistItem(wishlistItem),
  };
};

export const getWishlist = async (userId: number) => {
  const items = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: wishlistItemSelect,
  });

  return items.map(serializeWishlistItem);
};

export const removeFromWishlist = async (
  userId: number,
  productId: number
): Promise<void> => {
  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("Product is not in your wishlist", 404);
  }

  await prisma.wishlist.delete({
    where: { id: existing.id },
  });
};
