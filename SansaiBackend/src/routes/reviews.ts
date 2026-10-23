import { Router } from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
} from "../controllers/reviewController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  reviewIdParamSchema,
  createReviewSchema,
  updateReviewSchema,
} from "../validations/review.validation";

const router = Router();

// All review write actions require authentication
router.use(requireAuth);

/**
 * POST /api/v1/reviews
 * Submit a new review. Verified flag auto-set if user has a DELIVERED order for the product.
 */
router.post(
  "/",
  validate({ body: createReviewSchema }),
  createReview
);

/**
 * PUT /api/v1/reviews/:id
 * Update own review. Remains live/approved immediately.
 */
router.put(
  "/:id",
  validate({ params: reviewIdParamSchema, body: updateReviewSchema }),
  updateReview
);

/**
 * DELETE /api/v1/reviews/:id
 * Delete own review.
 */
router.delete(
  "/:id",
  validate({ params: reviewIdParamSchema }),
  deleteReview
);

/**
 * POST /api/v1/reviews/:id/helpful
 * Mark a review as helpful. Does not require authentication.
 */
router.post(
  "/:id/helpful",
  validate({ params: reviewIdParamSchema }),
  markReviewHelpful
);

export default router;
