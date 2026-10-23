import { NextFunction, Request, Response } from "express";
import {
  addToCart as addToCartService,
  clearCart as clearCartService,
  getCart as getCartService,
  removeCartItem as removeCartItemService,
  updateCartItem as updateCartItemService,
} from "../services/cart.service";

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = await addToCartService(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = await getCartService(userId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const cartItemId = Number(req.params.id);
    const data = await updateCartItemService(userId, cartItemId, req.body);

    res.status(200).json({
      success: true,
      message: "Cart item updated",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const cartItemId = Number(req.params.id);
    await removeCartItemService(userId, cartItemId);

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    await clearCartService(userId);

    res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    next(error);
  }
};
