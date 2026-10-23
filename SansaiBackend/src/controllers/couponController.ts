import { NextFunction, Request, Response } from "express";
import {
  applyCoupon as applyCouponService,
  createCoupon as createCouponService,
  deleteCoupon as deleteCouponService,
  getCouponById as getCouponByIdService,
  getCoupons as getCouponsService,
  updateCoupon as updateCouponService,
} from "../services/coupon.service";

export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await createCouponService(req.body);

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getCouponsService();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCouponById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const data = await getCouponByIdService(id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const data = await updateCouponService(id, req.body);

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await deleteCouponService(id);

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const applyCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { code, orderAmount } = req.body;
    const data = await applyCouponService(userId, code, orderAmount);

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
