import { Router } from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getProductReviews,
  getMyReview,
} from "../controllers/reviewController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  reviewIdParamSchema,
  productIdParamSchema,
  createReviewSchema,
  updateReviewSchema,
  productReviewsQuerySchema,
} from "../validations/review.validation";

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/products/:productId/reviews
 * Returns approved, paginated reviews for a product with rating distribution.
 */
router.get(
  "/:productId/reviews",
  validate({ params: productIdParamSchema, query: productReviewsQuerySchema }),
  getProductReviews
);

/**
 * GET /api/v1/products/:productId/reviews/mine
 * Get the authenticated user's own review for this product.
 */
router.get(
  "/:productId/reviews/mine",
  requireAuth,
  validate({ params: productIdParamSchema }),
  getMyReview
);

export default router;
