import { Router } from "express";
import { checkout } from "../controllers/checkoutController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { checkoutSchema } from "../validations/checkout.validation";

const router = Router();

// All checkout routes require authentication
router.use(requireAuth);

router.post("/", validate(checkoutSchema), checkout);

export default router;
