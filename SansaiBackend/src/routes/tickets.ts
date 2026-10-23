import { Router } from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
  closeTicketByUser,
} from "../controllers/ticketController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createTicketSchema,
  customerTicketListQuerySchema,
  ticketIdParamSchema,
} from "../validations/ticket.validation";

const router = Router();

// All support ticket routes require authentication
router.use(requireAuth);

router.post("/", validate(createTicketSchema), createTicket);
router.get("/", validate({ query: customerTicketListQuerySchema }), getTickets);
router.get("/:id", validate({ params: ticketIdParamSchema }), getTicketById);
router.patch("/:id/close", validate({ params: ticketIdParamSchema }), closeTicketByUser);

export default router;
