import { Router } from "express";
import { verifyPayment, handleFailure } from "../controllers/paymentController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  verifyPaymentSchema,
  paymentFailureSchema,
} from "../validations/payment.validation";

const router = Router();

// All payment routes require authentication
router.use(requireAuth);

router.post("/verify", validate(verifyPaymentSchema), verifyPayment);
router.post("/failure", validate(paymentFailureSchema), handleFailure);

export default router;
