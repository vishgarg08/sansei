import { Router } from "express";
import {
  applyCoupon,
  createCoupon,
  deleteCoupon,
  getCouponById,
  getCoupons,
  updateCoupon,
} from "../controllers/couponController";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  applyCouponSchema,
  createCouponSchema,
  couponIdParamSchema,
  updateCouponSchema,
} from "../validations/coupon.validation";

const router = Router();

// All coupon routes require authentication
router.use(requireAuth);

// Customer endpoints
router.post("/apply", validate(applyCouponSchema), applyCoupon);
router.get("/", getCoupons);

// Admin-only endpoints
router.post("/", requireAdmin, validate(createCouponSchema), createCoupon);
router.get("/:id", requireAdmin, validate({ params: couponIdParamSchema }), getCouponById);
router.patch(
  "/:id",
  requireAdmin,
  validate({ params: couponIdParamSchema, body: updateCouponSchema }),
  updateCoupon
);
router.delete("/:id", requireAdmin, validate({ params: couponIdParamSchema }), deleteCoupon);

export default router;