import { NextFunction, Request, Response } from "express";
import {
  createAddress as createAddressService,
  deleteAddress as deleteAddressService,
  getAddresses as getAddressesService,
  updateAddress as updateAddressService,
} from "../services/address.service";

export const createAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = await createAddressService(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = await getAddressesService(userId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const addressId = Number(req.params.id);
    const data = await updateAddressService(userId, addressId, req.body);

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const addressId = Number(req.params.id);
    await deleteAddressService(userId, addressId);

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
