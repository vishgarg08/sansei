import { NextFunction, Request, Response } from "express";
import { getAdminDashboard as getAdminDashboardService } from "../services/dashboard.service";

export const getAdminDashboard = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAdminDashboardService();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
