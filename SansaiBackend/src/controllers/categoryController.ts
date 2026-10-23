import { NextFunction, Request, Response } from "express";
import {
  createCategory as createCategoryRecord,
  deleteCategory as deleteCategoryRecord,
  getCategoryById as getCategoryByIdRecord,
  getCategoryBySlug as getCategoryBySlugRecord,
  listCategories as listCategoryRecords,
} from "../services/category.service";
import { listSubCategoriesByCategory } from "../services/subcategory.service";
import { updateCategory as updateCategoryRecord } from "../services/category.service";

export const listCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await listCategoryRecords();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getCategoryByIdRecord(Number(req.params.id));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getCategoryBySlugRecord(String(req.params.slug));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await createCategoryRecord(req.body);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await updateCategoryRecord(Number(req.params.id), req.body);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteCategoryRecord(Number(req.params.id));

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getCategorySubCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await listSubCategoriesByCategory(Number(req.params.categoryId));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
