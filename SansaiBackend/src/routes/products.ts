import { Router } from "express";
import {
  createProduct,
  addProductImageUrls,
  deleteUploadedImages,
  deleteProduct,
  getProductDetails,
  getProductBySlug,
  listProducts,
  uploadTemporaryProductImages,
  uploadProductImages,
  uploadProductVideos,
  updateProduct,
} from "../controllers/productController";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { productImageUpload, productVideoUpload } from "../middleware/upload";
import { validate } from "../middleware/validate";
import {
  createProductSchema,
  addProductImageUrlsSchema,
  deleteUploadedImagesSchema,
  listProductsQuerySchema,
  productIdParamSchema,
  productIdentifierParamSchema,
  productSlugParamSchema,
  uploadProductImagesSchema,
  updateProductSchema,
} from "../validations/product.validation";

const router = Router();

router.get("/", validate({ query: listProductsQuerySchema }), listProducts);
router.post(
  "/images/temp-upload",
  requireAuth,
  requireAdmin,
  productImageUpload.array("images", 8),
  uploadTemporaryProductImages
);
router.post(
  "/images/upload",
  requireAuth,
  requireAdmin,
  productImageUpload.array("images", 8),
  validate({ body: uploadProductImagesSchema }),
  uploadProductImages
);
router.post(
  "/images/url",
  requireAuth,
  requireAdmin,
  validate({ body: addProductImageUrlsSchema }),
  addProductImageUrls
);
router.post(
  "/videos/upload",
  requireAuth,
  requireAdmin,
  productVideoUpload.array("videos", 5),
  validate({ body: uploadProductImagesSchema }),
  uploadProductVideos
);
router.delete(
  "/images",
  requireAuth,
  requireAdmin,
  validate({ body: deleteUploadedImagesSchema }),
  deleteUploadedImages
);
router.get("/slug/:slug", validate({ params: productSlugParamSchema }), getProductBySlug);
router.get("/:identifier", validate({ params: productIdentifierParamSchema }), getProductDetails);

router.post("/", requireAuth, requireAdmin, validate(createProductSchema), createProduct);
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validate({
    params: productIdParamSchema,
    body: updateProductSchema,
  }),
  updateProduct
);
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validate({ params: productIdParamSchema }),
  deleteProduct
);

export default router;
