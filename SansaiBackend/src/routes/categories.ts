import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategoryBySlug,
  getCategorySubCategories,
  listCategories,
  updateCategory,
} from "../controllers/categoryController";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  categoryIdParamSchema,
  categorySlugParamSchema,
  categorySubcategoryParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../validations/catalog.validation";

const router = Router();

router.get("/", listCategories);
router.get(
  "/:categoryId/subcategories",
  validate({ params: categorySubcategoryParamSchema }),
  getCategorySubCategories
);
router.get("/slug/:slug", validate({ params: categorySlugParamSchema }), getCategoryBySlug);
router.get("/:id", validate({ params: categoryIdParamSchema }), getCategoryById);

router.post("/", requireAuth, requireAdmin, validate(createCategorySchema), createCategory);
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validate({
    params: categoryIdParamSchema,
    body: updateCategorySchema,
  }),
  updateCategory
);
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validate({ params: categoryIdParamSchema }),
  deleteCategory
);

export default router;
