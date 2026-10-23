import { Router } from "express";
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/cartController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  addToCartSchema,
  cartItemIdParamSchema,
  updateCartItemSchema,
} from "../validations/cart.validation";

const router = Router();

// All cart routes require authentication
router.use(requireAuth);

router.post("/", validate(addToCartSchema), addToCart);
router.get("/", getCart);
router.patch(
  "/:id",
  validate({ params: cartItemIdParamSchema, body: updateCartItemSchema }),
  updateCartItem
);
router.delete("/clear", clearCart);
router.delete(
  "/:id",
  validate({ params: cartItemIdParamSchema }),
  removeCartItem
);

export default router;
