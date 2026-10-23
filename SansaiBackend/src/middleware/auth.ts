import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { getAuthUserSummary, getSessionState } from "../services/auth-state.service";
import { verifyAccessToken } from "../utils/auth";

const sendUnauthorized = (res: Response, message: string): void => {
  res.status(401).json({
    success: false,
    message,
  });
};

const sendForbidden = (res: Response, message: string): void => {
  res.status(403).json({
    success: false,
    message,
  });
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      sendUnauthorized(res, "Authorization token is required");
      return;
    }

    const token = authorization.slice(7);
    const payload = verifyAccessToken(token);
    const userId = Number(payload.sub);

    const sessionState = await getSessionState(payload.sessionId);

    if (
      !sessionState ||
      !sessionState.isActive ||
      sessionState.userId !== userId ||
      new Date(sessionState.expiresAt).getTime() <= Date.now()
    ) {
      sendUnauthorized(res, "Session is invalid or expired");
      return;
    }

    const user = await getAuthUserSummary(userId);

    if (!user || !user.isActive || user.deletedAt) {
      sendUnauthorized(res, "User not found or inactive");
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    sendUnauthorized(res, "Invalid or expired access token");
  }
};

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, "Authentication is required");
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendForbidden(res, "You do not have permission to perform this action");
      return;
    }

    next();
  };

export const requireAdmin = requireRole(Role.ADMIN);
