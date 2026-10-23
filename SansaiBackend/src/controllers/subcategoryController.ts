import { NextFunction, Request, Response } from "express";
import {
  createSubCategory as createSubCategoryRecord,
  deleteSubCategory as deleteSubCategoryRecord,
  getSubCategoryById as getSubCategoryByIdRecord,
  getSubCategoryBySlug as getSubCategoryBySlugRecord,
  listSubCategories as listSubCategoryRecords,
  updateSubCategory as updateSubCategoryRecord,
} from "../services/subcategory.service";

export const listSubCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await listSubCategoryRecords(req.query as { categoryId?: number });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getSubCategoryByIdRecord(Number(req.params.id));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getSubCategoryBySlugRecord(String(req.params.slug));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createSubCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await createSubCategoryRecord(req.body);

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await updateSubCategoryRecord(Number(req.params.id), req.body);

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteSubCategoryRecord(Number(req.params.id));

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
