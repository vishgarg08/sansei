import { NextFunction, Request, Response } from "express";
import {
  getCurrentUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  refreshUserToken,
  registerUser,
} from "../services/auth.service";
import { getClientIp, getUserAgent } from "../utils/request";

const getRequestContext = (req: Request) => ({
  ipAddress: getClientIp(req),
  userAgent: getUserAgent(req),
});

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await registerUser(req.body, getRequestContext(req));

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await loginUser(req.body, getRequestContext(req));

    res.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await loginWithGoogle(req.body.token, getRequestContext(req));

    res.status(200).json({
      success: true,
      message: "Google login successful",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await refreshUserToken(
      req.body.refreshToken,
      getRequestContext(req)
    );

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await logoutUser(req.body.refreshToken);

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getCurrentUser(req.user!.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
