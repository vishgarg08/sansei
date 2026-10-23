import { Router } from "express";
import {
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
} from "../controllers/adminOrderController";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  orderIdParamSchema,
  adminOrderListQuerySchema,
  updateOrderStatusSchema,
} from "../validations/order.validation";

const router = Router();

// All admin order routes require authentication + admin role
router.use(requireAuth);
router.use(requireAdmin);

router.get("/", validate({ query: adminOrderListQuerySchema }), getAdminOrders);
router.get(
  "/:id",
  validate({ params: orderIdParamSchema }),
  getAdminOrderById
);
router.patch(
  "/:id/status",
  validate({ params: orderIdParamSchema, body: updateOrderStatusSchema }),
  updateOrderStatus
);

export default router;
