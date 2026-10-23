import { NextFunction, Request, Response } from "express";
import {
  getInventoryLogs as getInventoryLogsService,
  getVariantInventoryLogs as getVariantInventoryLogsService,
  getLowStockVariants as getLowStockVariantsService,
  getInventoryDashboard as getInventoryDashboardService,
} from "../services/inventory.service";

// ─── GET /admin/inventory/logs ───────────────────────────────────────────────

export const getInventoryLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query as any;
    const data = await getInventoryLogsService({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
      productId: query.productId ? Number(query.productId) : undefined,
      variantId: query.variantId ? Number(query.variantId) : undefined,
      action: query.action ?? undefined,
      reference: query.reference ?? undefined,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    });

    res.status(200).json({
      success: true,
      data: data.logs,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /admin/inventory/variants/:variantId/logs ───────────────────────────

export const getVariantInventoryLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = Number(req.params.productId);
    const variantId = Number(req.params.variantId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const data = await getVariantInventoryLogsService(productId, variantId, page, limit);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /admin/inventory/low-stock ─────────────────────────────────────────

export const getLowStockVariants = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query as any;
    const data = await getLowStockVariantsService({
      threshold: query.threshold ? Number(query.threshold) : 10,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /admin/inventory/dashboard ─────────────────────────────────────────

export const getInventoryDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const threshold = req.query.threshold ? Number(req.query.threshold) : 10;
    const data = await getInventoryDashboardService(threshold);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
