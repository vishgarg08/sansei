import { Router } from "express";
import {
  getOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/orderController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  orderIdParamSchema,
  cancelOrderSchema,
  orderListQuerySchema,
} from "../validations/order.validation";

const router = Router();

// All order routes require authentication
router.use(requireAuth);

router.get("/", validate({ query: orderListQuerySchema }), getOrders);
router.get(
  "/:id",
  validate({ params: orderIdParamSchema }),
  getOrderById
);
router.post(
  "/:id/cancel",
  validate({ params: orderIdParamSchema, body: cancelOrderSchema }),
  cancelOrder
);

export default router;
