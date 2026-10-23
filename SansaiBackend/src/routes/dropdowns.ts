import { Router } from "express";
import {
  getCategoriesDropdown,
  getSubCategoriesDropdown,
  getDistinctSizes,
  getDistinctColors,
  getProductSizesAndColors,
  getProductFormData,
} from "../controllers/dropdownController";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  subCategoriesDropdownQuerySchema,
  productSizesColorsQuerySchema,
  productFormDataQuerySchema,
} from "../validations/dropdown.validation";

const router = Router();

// All dropdown routes require admin authentication
router.use(requireAuth, requireAdmin);

router.get("/categories", getCategoriesDropdown);
router.get(
  "/subcategories",
  validate({ query: subCategoriesDropdownQuerySchema }),
  getSubCategoriesDropdown
);
router.get("/sizes", getDistinctSizes);
router.get("/colors", getDistinctColors);
router.get(
  "/sizes-colors",
  validate({ query: productSizesColorsQuerySchema }),
  getProductSizesAndColors
);
router.get(
  "/product-form-data",
  validate({ query: productFormDataQuerySchema }),
  getProductFormData
);

export default router;
