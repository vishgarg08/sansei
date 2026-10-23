import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import multer from "multer";
import { logger } from "../config/logger";
import { AppError } from "../utils/appError";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = res.locals.requestId;

  if (error instanceof AppError) {
    logger.warn(
      {
        err: error,
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: error.statusCode,
      },
      "application error"
    );

    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });
    return;
  }

  if (error instanceof TokenExpiredError) {
    logger.warn(
      {
        err: error,
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: 401,
      },
      "expired token"
    );

    res.status(401).json({
      success: false,
      message: "Token has expired",
    });
    return;
  }

  if (error instanceof JsonWebTokenError) {
    logger.warn(
      {
        err: error,
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: 401,
      },
      "invalid token"
    );

    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    logger.warn(
      {
        err: error,
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: 400,
      },
      "multer error"
    );

    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Each image must be 5MB or smaller"
        : error.code === "LIMIT_FILE_COUNT"
          ? "You can upload up to 8 product images at a time"
          : "Invalid upload request";

    res.status(400).json({
      success: false,
      message,
    });
    return;
  }

  logger.error(
    {
      err: error,
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: 500,
    },
    "unhandled error"
  );

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
