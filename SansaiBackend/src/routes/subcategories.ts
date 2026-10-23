import { Router } from "express";
import {
  createSubCategory,
  deleteSubCategory,
  getSubCategoryById,
  getSubCategoryBySlug,
  listSubCategories,
  updateSubCategory,
} from "../controllers/subcategoryController";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createSubCategorySchema,
  listSubCategoriesQuerySchema,
  subCategoryIdParamSchema,
  subCategorySlugParamSchema,
  updateSubCategorySchema,
} from "../validations/catalog.validation";

const router = Router();

router.get("/", validate({ query: listSubCategoriesQuerySchema }), listSubCategories);
router.get("/slug/:slug", validate({ params: subCategorySlugParamSchema }), getSubCategoryBySlug);
router.get("/:id", validate({ params: subCategoryIdParamSchema }), getSubCategoryById);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(createSubCategorySchema),
  createSubCategory
);
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validate({
    params: subCategoryIdParamSchema,
    body: updateSubCategorySchema,
  }),
  updateSubCategory
);
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validate({ params: subCategoryIdParamSchema }),
  deleteSubCategory
);

export default router;
