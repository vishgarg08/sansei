import { Router } from "express";
import {
  getAdminReviews,
  getAdminReviewById,
  adminDeleteReview,
} from "../controllers/reviewController";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  reviewIdParamSchema,
  adminReviewListQuerySchema,
} from "../validations/review.validation";

const router = Router();

// All admin review routes require authentication + admin role
router.use(requireAuth, requireAdmin);

/**
 * GET /api/v1/admin/reviews
 * Paginated list of all reviews. Filter by product, user, rating, approval status, verified.
 */
router.get(
  "/",
  validate({ query: adminReviewListQuerySchema }),
  getAdminReviews
);

/**
 * GET /api/v1/admin/reviews/:id
 * Get a single review by ID.
 */
router.get(
  "/:id",
  validate({ params: reviewIdParamSchema }),
  getAdminReviewById
);

/**
 * DELETE /api/v1/admin/reviews/:id
 * Hard delete a review (reject / spam removal). Recalculates product averageRating.
 */
router.delete(
  "/:id",
  validate({ params: reviewIdParamSchema }),
  adminDeleteReview
);

export default router;
