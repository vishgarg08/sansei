import { NextFunction, Request, Response } from "express";
import {
  listVariants as listVariantRecords,
  getVariantById as getVariantByIdRecord,
  createVariants as createVariantRecords,
  updateVariant as updateVariantRecord,
  deleteVariant as deleteVariantRecord,
  updateVariantStock as updateVariantStockRecord,
  bulkUpdateStock as bulkUpdateStockRecord,
  getStockSummary as getStockSummaryRecord,
} from "../services/variant.service";

export const listVariants = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await listVariantRecords(Number(req.params.productId));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getVariantById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getVariantByIdRecord(
      Number(req.params.productId),
      Number(req.params.variantId)
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createVariants = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await createVariantRecords(
      Number(req.params.productId),
      req.body.variants
    );

    res.status(201).json({
      success: true,
      message: "Variants created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVariant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await updateVariantRecord(
      Number(req.params.productId),
      Number(req.params.variantId),
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVariant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteVariantRecord(
      Number(req.params.productId),
      Number(req.params.variantId)
    );

    res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateVariantStock = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await updateVariantStockRecord(
      Number(req.params.productId),
      Number(req.params.variantId),
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateStock = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await bulkUpdateStockRecord(
      Number(req.params.productId),
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Bulk stock update completed successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getStockSummaryRecord(Number(req.params.productId));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
