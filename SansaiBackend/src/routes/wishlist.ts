import { Router } from "express";
import {
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} from "../controllers/wishlistController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { wishlistProductIdParamSchema } from "../validations/cart.validation";

const router = Router();

// All wishlist routes require authentication
router.use(requireAuth);

router.get("/", getWishlist);
router.post(
  "/:productId",
  validate({ params: wishlistProductIdParamSchema }),
  toggleWishlist
);
router.delete(
  "/:productId",
  validate({ params: wishlistProductIdParamSchema }),
  removeFromWishlist
);

export default router;
