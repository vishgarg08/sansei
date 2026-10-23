import { Router } from "express";
import {
  listVariants,
  getVariantById,
  createVariants,
  updateVariant,
  deleteVariant,
  updateVariantStock,
  bulkUpdateStock,
  getStockSummary,
} from "../controllers/variantController";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  productIdParamSchema,
  variantIdParamSchema,
  createVariantsSchema,
  updateVariantSchema,
  updateStockSchema,
  bulkStockUpdateSchema,
} from "../validations/variant.validation";

const router = Router({ mergeParams: true });

// All variant routes require admin authentication
router.use(requireAuth, requireAdmin);

// List & Create
router.get(
  "/",
  validate({ params: productIdParamSchema }),
  listVariants
);
router.post(
  "/",
  validate({ params: productIdParamSchema, body: createVariantsSchema }),
  createVariants
);

// Stock summary (placed before /:variantId to avoid route conflict)
router.get(
  "/stock-summary",
  validate({ params: productIdParamSchema }),
  getStockSummary
);

// Bulk stock update
router.put(
  "/bulk-stock",
  validate({ params: productIdParamSchema, body: bulkStockUpdateSchema }),
  bulkUpdateStock
);

// Single variant operations
router.get(
  "/:variantId",
  validate({ params: variantIdParamSchema }),
  getVariantById
);
router.put(
  "/:variantId",
  validate({ params: variantIdParamSchema, body: updateVariantSchema }),
  updateVariant
);
router.delete(
  "/:variantId",
  validate({ params: variantIdParamSchema }),
  deleteVariant
);

// Stock update for a single variant
router.put(
  "/:variantId/stock",
  validate({ params: variantIdParamSchema, body: updateStockSchema }),
  updateVariantStock
);

export default router;
