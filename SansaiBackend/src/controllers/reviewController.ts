import { NextFunction, Request, Response } from "express";
import {
  createReview as createReviewService,
  updateReview as updateReviewService,
  deleteReview as deleteReviewService,
  markReviewHelpful as markReviewHelpfulService,
  getProductReviews as getProductReviewsService,
  getMyReview as getMyReviewService,
  getAdminReviews as getAdminReviewsService,
  adminDeleteReview as adminDeleteReviewService,
  getReviewById as getReviewByIdService,
} from "../services/review.service";

// ─── Customer Endpoints ───────────────────────────────────────────────────────

/**
 * POST /api/v1/reviews
 * Create a review. User must be authenticated.
 * Verified flag set automatically if user has a DELIVERED order for the product.
 */
export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = await createReviewService(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/reviews/:id
 * Update own review.
 */
export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const reviewId = Number(req.params.id);
    const data = await updateReviewService(userId, reviewId, req.body);

    res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/reviews/:id
 * Delete own review.
 */
export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const reviewId = Number(req.params.id);
    await deleteReviewService(userId, reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/reviews/:id/helpful
 * Mark a review as helpful (no auth required).
 */
export const markReviewHelpful = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reviewId = Number(req.params.id);
    const data = await markReviewHelpfulService(reviewId);

    res.status(200).json({
      success: true,
      message: "Marked as helpful.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/products/:productId/reviews
 * Public — returns approved reviews for a product with rating distribution.
 */
export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = Number(req.params.productId);
    const data = await getProductReviewsService(productId, req.query as any);

    res.status(200).json({
      success: true,
      data: data.reviews,
      ratingDistribution: data.ratingDistribution,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/products/:productId/reviews/mine
 * Get the authenticated user's own review for a product.
 */
export const getMyReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const productId = Number(req.params.productId);
    const data = await getMyReviewService(userId, productId);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ─── Admin Endpoints ──────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/reviews
 * Paginated list of all reviews with filters.
 */
export const getAdminReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query as any;
    const data = await getAdminReviewsService({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
      productId: query.productId ? Number(query.productId) : undefined,
      userId: query.userId ? Number(query.userId) : undefined,
      rating: query.rating ? Number(query.rating) : undefined,
      isApproved:
        query.isApproved !== undefined ? query.isApproved === "true" : undefined,
      verified:
        query.verified !== undefined ? query.verified === "true" : undefined,
    });

    res.status(200).json({
      success: true,
      data: data.reviews,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/reviews/:id
 * Get a single review by ID.
 */
export const getAdminReviewById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reviewId = Number(req.params.id);
    const data = await getReviewByIdService(reviewId);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};



/**
 * DELETE /api/v1/admin/reviews/:id
 * Admin hard-delete (reject/spam). Recalculates product rating.
 */
export const adminDeleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reviewId = Number(req.params.id);
    await adminDeleteReviewService(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
