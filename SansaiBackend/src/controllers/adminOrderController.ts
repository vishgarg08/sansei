import { NextFunction, Request, Response } from "express";
import {
  getAdminOrders as getAdminOrdersService,
  getAdminOrderById as getAdminOrderByIdService,
  updateOrderStatus as updateOrderStatusService,
} from "../services/admin-order.service";

export const getAdminOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAdminOrdersService(req.query as any);

    res.status(200).json({
      success: true,
      data: data.orders,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = Number(req.params.id);
    const data = await getAdminOrderByIdService(orderId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = Number(req.params.id);
    const adminId = req.user!.id;
    const data = await updateOrderStatusService(orderId, req.body, adminId);

    res.status(200).json({
      success: true,
      message: `Order status updated to ${req.body.status}`,
      data,
    });
  } catch (error) {
    next(error);
  }
};
