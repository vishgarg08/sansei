import { Router } from "express";
import {
  getAdminCustomers,
  getAdminCustomerById,
} from "../controllers/adminCustomerController";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  customerListQuerySchema,
  customerIdParamSchema,
} from "../validations/customer.validation";

const router = Router();

// All admin customer routes require authentication and admin role
router.use(requireAuth);
router.use(requireAdmin);

router.get("/", validate({ query: customerListQuerySchema }), getAdminCustomers);
router.get(
  "/:id",
  validate({ params: customerIdParamSchema }),
  getAdminCustomerById
);

export default router;
