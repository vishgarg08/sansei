import { NextFunction, Request, Response } from "express";
import {
  getOrders as getOrdersService,
  getOrderById as getOrderByIdService,
  cancelOrder as cancelOrderService,
} from "../services/order.service";

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = await getOrdersService(userId, req.query as any);

    res.status(200).json({
      success: true,
      data: data.orders,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const orderId = Number(req.params.id);
    const data = await getOrderByIdService(userId, orderId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const orderId = Number(req.params.id);
    const data = await cancelOrderService(userId, orderId, req.body.reason);

    res.status(200).json({
      success: true,
      message: data.message,
      data,
    });
  } catch (error) {
    next(error);
  }
};
