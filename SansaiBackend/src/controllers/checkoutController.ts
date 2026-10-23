import { NextFunction, Request, Response } from "express";
import { processCheckout } from "../services/checkout.service";

export const checkout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = await processCheckout(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
