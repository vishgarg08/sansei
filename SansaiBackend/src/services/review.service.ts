import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/prisma";
import { AppError } from "../utils/appError";
import type {
  CreateReviewInput,
  UpdateReviewInput,
  ReviewListQuery,
  AdminReviewListQuery,
  SerializedReview,
} from "../types/review";

// ─── Serializers ─────────────────────────────────────────────────────────────

const serializeReview = (review: any) => ({
  id: review.id,
  userId: review.userId,
  productId: review.productId,
  rating: review.rating,
  comment: review.comment ?? null,
  images: review.images ? (review.images as string).split(",").filter(Boolean) : [],
  verified: review.verified,
  isApproved: review.isApproved,
  helpful: review.helpful,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
  user: review.user
    ? {
        id: review.user.id,
        name: review.user.name,
        profileImage: review.user.profileImage ?? null,
      }
    : undefined,
  product: review.product
    ? {
        id: review.product.id,
        name: review.product.name,
        slug: review.product.slug,
      }
    : undefined,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Re-calculates averageRating on the product after any review change.
 * Called inside transactions and standalone.
 */
const recalcProductRating = async (
  tx: Prisma.TransactionClient,
  productId: number
): Promise<void> => {
  const agg = await tx.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: { id: true },
  });

  await tx.product.update({
    where: { id: productId },
    data: {
      averageRating: new Prisma.Decimal(
        (agg._avg.rating ?? 0).toFixed(2)
      ),
    },
  });
};

// ─── Customer: Create Review ──────────────────────────────────────────────────

/**
 * Creates a review for a product.
 * Rules:
 *  1. Only users who have a DELIVERED order containing this product can review.
 *  2. One review per user per product (@@unique constraint).
 *  3. If the user has a DELIVERED order for this product → verified = true automatically.
 *  4. Review is auto-approved (isApproved = true) like Flipkart/Amazon.
 */
export const createReview = async (userId: number, input: CreateReviewInput) => {
  const { productId, rating, comment, images } = input;

  // 1. Verify product exists and is active
  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true, deletedAt: null },
    select: { id: true, name: true },
  });

  if (!product) {
    throw new AppError("Product not found or unavailable", 404);
  }

  // 2. Check for an existing review (one per user per product)
  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });

  if (existing) {
    throw new AppError("You have already reviewed this product", 409);
  }

  // 3. Check if the user has a verified purchase (DELIVERED order containing this product)
  const deliveredOrder = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: "DELIVERED",
      },
    },
    select: { id: true },
  });

  const verified = deliveredOrder !== null;

  // 4. Create review in a transaction + recalc product rating immediately
  const review = await prisma.$transaction(async (tx) => {
    const newReview = await tx.review.create({
      data: {
        userId,
        productId,
        rating,
        comment: comment?.trim() || null,
        images: images && images.length > 0 ? images.join(",") : null,
        verified,
        isApproved: true, // Auto-approved directly
        helpful: 0,
      },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    // Recalculate average rating for the product immediately since it's live
    await recalcProductRating(tx, productId);

    return newReview;
  });

  return serializeReview(review);
};

// ─── Customer: Update Own Review ─────────────────────────────────────────────

/**
 * Update a user's own review (rating / comment / images).
 * Keeps isApproved as true (automatically approved).
 */
export const updateReview = async (
  userId: number,
  reviewId: number,
  input: UpdateReviewInput
) => {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId },
  });

  if (!review) {
    throw new AppError("Review not found or does not belong to you", 404);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedReview = await tx.review.update({
      where: { id: reviewId },
      data: {
        ...(input.rating !== undefined && { rating: input.rating }),
        ...(input.comment !== undefined && { comment: input.comment.trim() || null }),
        ...(input.images !== undefined && {
          images: input.images.length > 0 ? input.images.join(",") : null,
        }),
        isApproved: true, // Remains approved/live after edit
      },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    // Re-calc rating (approved review count may change)
    await recalcProductRating(tx, review.productId);

    return updatedReview;
  });

  return serializeReview(updated);
};

// ─── Customer: Delete Own Review ─────────────────────────────────────────────

export const deleteReview = async (userId: number, reviewId: number): Promise<void> => {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId },
    select: { id: true, productId: true },
  });

  if (!review) {
    throw new AppError("Review not found or does not belong to you", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: reviewId } });
    await recalcProductRating(tx, review.productId);
  });
};

// ─── Customer: Mark Review as Helpful ────────────────────────────────────────

export const markReviewHelpful = async (reviewId: number): Promise<{ helpful: number }> => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, isApproved: true },
  });

  if (!review || !review.isApproved) {
    throw new AppError("Review not found", 404);
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { helpful: { increment: 1 } },
    select: { helpful: true },
  });

  return { helpful: updated.helpful };
};

// ─── Public: Get Reviews for a Product ───────────────────────────────────────

/**
 * Returns paginated, approved reviews for a product.
 * Public endpoint — no auth required.
 */
export const getProductReviews = async (
  productId: number,
  query: ReviewListQuery
) => {
  const { page, limit, rating, verified } = query;
  const skip = (page - 1) * limit;

  // Verify product exists
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    select: { id: true },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const where: Prisma.ReviewWhereInput = {
    productId,
    isApproved: true, // Public only sees approved reviews
    ...(rating && { rating }),
    ...(verified !== undefined && { verified }),
  };

  const [reviews, total, ratingStats] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
      },
      orderBy: [{ helpful: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),

    prisma.review.count({ where }),

    // Rating distribution (1-5)
    prisma.review.groupBy({
      by: ["rating"],
      where: { productId, isApproved: true },
      _count: { id: true },
    }),
  ]);

  // Build rating distribution map
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of ratingStats) {
    distribution[row.rating] = row._count.id;
  }

  return {
    reviews: reviews.map(serializeReview),
    ratingDistribution: distribution,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

// ─── Customer: Get My Review for a Product ───────────────────────────────────

export const getMyReview = async (userId: number, productId: number) => {
  const review = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } },
    include: {
      user: { select: { id: true, name: true, profileImage: true } },
      product: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!review) {
    throw new AppError("You have not reviewed this product", 404);
  }

  return serializeReview(review);
};

// ─── Admin: Get All Reviews ───────────────────────────────────────────────────

export const getAdminReviews = async (query: AdminReviewListQuery) => {
  const { page, limit, productId, userId, rating, isApproved, verified } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ReviewWhereInput = {
    ...(productId && { productId }),
    ...(userId && { userId }),
    ...(rating && { rating }),
    ...(isApproved !== undefined && { isApproved }),
    ...(verified !== undefined && { verified }),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews: reviews.map(serializeReview),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};



// ─── Admin: Reject / Delete Review ───────────────────────────────────────────

/**
 * Admin hard-deletes a review (rejected/spam).
 * Recalculates product rating after deletion.
 */
export const adminDeleteReview = async (reviewId: number): Promise<void> => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, productId: true },
  });

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: reviewId } });
    await recalcProductRating(tx, review.productId);
  });
};

// ─── Admin: Get Single Review ─────────────────────────────────────────────────

export const getReviewById = async (reviewId: number) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: { select: { id: true, name: true, profileImage: true } },
      product: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  return serializeReview(review);
};
