import { NextFunction, Request, Response } from "express";
import {
  verifyPayment as verifyPaymentService,
  handlePaymentFailure as handlePaymentFailureService,
} from "../services/payment.service";

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = await verifyPaymentService(userId, req.body);

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const handleFailure = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = await handlePaymentFailureService(userId, req.body);

    res.status(200).json({
      success: true,
      message: data.message,
      data,
    });
  } catch (error) {
    next(error);
  }
};
