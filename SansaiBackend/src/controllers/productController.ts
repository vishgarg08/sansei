import { NextFunction, Request, Response } from "express";
import {
  createProduct as createProductRecord,
  deleteProduct as deleteProductRecord,
  getProductDetails as getProductDetailsRecord,
  getProductById as getProductByIdRecord,
  getProductBySlug as getProductBySlugRecord,
  listProducts as listProductRecords,
  saveProductImageUrls as saveProductImageUrlsRecord,
  saveUploadedProductImages as saveUploadedProductImagesRecord,
  saveUploadedProductVideos as saveUploadedProductVideosRecord,
  updateProduct as updateProductRecord,
} from "../services/product.service";
import {
  deleteCloudinaryAssets as deleteUploadedImagesRecord,
  uploadProductImages as uploadProductImagesRecord,
} from "../services/media.service";
import type { ListProductsQuery } from "../services/product.service";

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await createProductRecord(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await updateProductRecord(Number(req.params.id), req.body);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getProductByIdRecord(Number(req.params.id));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getProductBySlugRecord(String(req.params.slug));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getProductDetailsRecord(String(req.params.identifier));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const listProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await listProductRecords(req.query as unknown as ListProductsQuery);

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProductImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const data = await saveUploadedProductImagesRecord(Number(req.body.productId), files);

    res.status(201).json({
      success: true,
      message: "Product images uploaded and saved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadTemporaryProductImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const data = await uploadProductImagesRecord(files);

    res.status(201).json({
      success: true,
      message: "Product images uploaded successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProductVideos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const data = await saveUploadedProductVideosRecord(Number(req.body.productId), files);
    res.status(201).json({
      success: true,
      message: "Product videos uploaded and saved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const addProductImageUrls = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await saveProductImageUrlsRecord(
      Number(req.body.productId),
      req.body.images
    );

    res.status(201).json({
      success: true,
      message: "Product image URLs saved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUploadedImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteUploadedImagesRecord(req.body.publicIds);

    res.status(200).json({
      success: true,
      message: "Uploaded product images deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteProductRecord(Number(req.params.id));

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
