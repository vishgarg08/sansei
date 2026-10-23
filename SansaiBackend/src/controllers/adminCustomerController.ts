import { NextFunction, Request, Response } from "express";
import {
  getAdminCustomers as getAdminCustomersService,
  getAdminCustomerById as getAdminCustomerByIdService,
} from "../services/admin-customer.service";

export const getAdminCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAdminCustomersService(req.query as any);

    res.status(200).json({
      success: true,
      data: data.customers,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = Number(req.params.id);
    const data = await getAdminCustomerByIdService(customerId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
