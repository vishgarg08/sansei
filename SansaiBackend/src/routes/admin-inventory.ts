import { Router } from "express";
import {
  getInventoryLogs,
  getVariantInventoryLogs,
  getLowStockVariants,
  getInventoryDashboard,
} from "../controllers/inventoryController";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  inventoryLogQuerySchema,
  variantInventoryParamsSchema,
  paginationQuerySchema,
  lowStockQuerySchema,
  inventoryDashboardQuerySchema,
} from "../validations/inventory.validation";

const router = Router();

// All inventory routes are admin-only
router.use(requireAuth, requireAdmin);

/**
 * GET /api/v1/admin/inventory/dashboard
 * High-level inventory health: total stock, reserved, low-stock counts, 7-day activity.
 */
router.get(
  "/dashboard",
  validate({ query: inventoryDashboardQuerySchema }),
  getInventoryDashboard
);

/**
 * GET /api/v1/admin/inventory/logs
 * Paginated inventory log history with optional filters:
 *   ?productId=1&variantId=2&action=OUT&reference=ORDER&dateFrom=2024-01-01&dateTo=2024-12-31
 */
router.get(
  "/logs",
  validate({ query: inventoryLogQuerySchema }),
  getInventoryLogs
);

/**
 * GET /api/v1/admin/inventory/low-stock
 * Variants whose available stock is at or below threshold (default 10).
 *   ?threshold=5&page=1&limit=20
 */
router.get(
  "/low-stock",
  validate({ query: lowStockQuerySchema }),
  getLowStockVariants
);

/**
 * GET /api/v1/admin/inventory/products/:productId/variants/:variantId/logs
 * Full stock history for a specific product variant.
 */
router.get(
  "/products/:productId/variants/:variantId/logs",
  validate({
    params: variantInventoryParamsSchema,
    query: paginationQuerySchema,
  }),
  getVariantInventoryLogs
);

export default router;
