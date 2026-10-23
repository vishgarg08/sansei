import { Router } from "express";
import { getAdminDashboard } from "../controllers/dashboardController";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth, requireAdmin);
router.get("/", getAdminDashboard);

export default router;
