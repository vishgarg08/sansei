import cors, { CorsOptions } from "cors";
import rateLimit from "express-rate-limit";
import helmet, { HelmetOptions } from "helmet";
import { env } from "./env";
import { AppError } from "../utils/appError";

const allowedOrigins = new Set(env.frontendOrigins);

const isLocalFrontendOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
      url.origin === origin
    );
  } catch {
    return false;
  }
};

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || !env.isProduction) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.has(origin) || isLocalFrontendOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new AppError("Origin not allowed by CORS", 403));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type", "X-Request-Id"],
  exposedHeaders: ["Retry-After", "X-Request-Id"],
};

export const helmetOptions: HelmetOptions = {
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
};

const buildRateLimitMessage = (message: string) => ({
  success: false,
  message,
});

export const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildRateLimitMessage("Too many requests. Please try again later."),
});

export const authLimiter = rateLimit({
  windowMs: env.authRateLimitWindowMs,
  limit: env.authRateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: buildRateLimitMessage(
    "Too many authentication attempts. Please try again later."
  ),
});

export const securityMiddleware = {
  cors: cors(corsOptions),
  helmet: helmet(helmetOptions),
};
