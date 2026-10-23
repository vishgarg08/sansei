import { NextFunction, Request, Response } from "express";
import {
  getWishlist as getWishlistService,
  removeFromWishlist as removeFromWishlistService,
  toggleWishlist as toggleWishlistService,
} from "../services/wishlist.service";

export const toggleWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const productId = Number(req.params.productId);
    const data = await toggleWishlistService(userId, productId);

    const statusCode = data.action === "added" ? 201 : 200;

    res.status(statusCode).json({
      success: true,
      message:
        data.action === "added"
          ? "Product added to wishlist"
          : "Product removed from wishlist",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = await getWishlistService(userId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const productId = Number(req.params.productId);
    await removeFromWishlistService(userId, productId);

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    next(error);
  }
};
