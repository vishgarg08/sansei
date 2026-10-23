import { Request } from "express";

export const getClientIp = (req: Request): string | undefined => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0]?.trim();
  }

  return req.ip || req.socket.remoteAddress || undefined;
};

export const getUserAgent = (req: Request): string | undefined =>
  req.get("user-agent") ?? undefined;
