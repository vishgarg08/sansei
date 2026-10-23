import { NextFunction, Request, Response } from "express";
import { getHomePageData } from "../services/home.service";

export const getHome = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getHomePageData();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
