import { Router } from "express";
import {
  getAdminTickets,
  getAdminTicketById,
  updateTicketStatus,
} from "../controllers/adminTicketController";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  adminTicketListQuerySchema,
  ticketIdParamSchema,
  updateTicketStatusSchema,
} from "../validations/ticket.validation";

const router = Router();

// All admin support ticket routes require authentication + admin role
router.use(requireAuth);
router.use(requireAdmin);

router.get("/", validate({ query: adminTicketListQuerySchema }), getAdminTickets);
router.get("/:id", validate({ params: ticketIdParamSchema }), getAdminTicketById);
router.patch(
  "/:id",
  validate({ params: ticketIdParamSchema, body: updateTicketStatusSchema }),
  updateTicketStatus
);

export default router;
