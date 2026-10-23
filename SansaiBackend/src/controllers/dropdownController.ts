import { NextFunction, Request, Response } from "express";
import {
  getCategoriesDropdown as getCategoriesDropdownData,
  getSubCategoriesDropdown as getSubCategoriesDropdownData,
  getDistinctSizes as getDistinctSizesData,
  getDistinctColors as getDistinctColorsData,
  getProductSizesAndColors as getProductSizesAndColorsData,
  getProductFormData as getProductFormDataData,
} from "../services/dropdown.service";

export const getCategoriesDropdown = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getCategoriesDropdownData();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubCategoriesDropdown = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categoryId = req.query.categoryId
      ? Number(req.query.categoryId)
      : undefined;

    const data = await getSubCategoriesDropdownData(categoryId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getDistinctSizes = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getDistinctSizesData();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getDistinctColors = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getDistinctColorsData();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductSizesAndColors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getProductSizesAndColorsData(
      Number(req.query.productId)
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductFormData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categoryId = req.query.categoryId
      ? Number(req.query.categoryId)
      : undefined;

    const data = await getProductFormDataData(categoryId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
