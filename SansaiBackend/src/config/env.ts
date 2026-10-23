import "dotenv/config";

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const getOptionalEnv = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

const getNumberEnv = (key: string, fallback: number): number => {
  const rawValue = process.env[key];

  if (rawValue === undefined) {
    return fallback;
  }

  const parsedValue = Number(rawValue);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }

  return parsedValue;
};

const getBooleanEnv = (key: string, fallback: boolean): boolean => {
  const rawValue = process.env[key];

  if (rawValue === undefined) {
    return fallback;
  }

  const normalizedValue = rawValue.trim().toLowerCase();

  if (["true", "1", "yes", "on"].includes(normalizedValue)) {
    return true;
  }

  if (["false", "0", "no", "off"].includes(normalizedValue)) {
    return false;
  }

  throw new Error(`Environment variable ${key} must be a boolean`);
};

const getArrayEnv = (key: string): string[] => {
  const rawValue = getOptionalEnv(key);

  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

const databaseUrl = getEnv("DATABASE_URL");
if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
  throw new Error("DATABASE_URL must be a valid PostgreSQL connection string");
}

const frontendOrigins = Array.from(new Set([
  "https://sensaifrontend-czbs.vercel.app",
  ...getArrayEnv("FRONTEND_ORIGINS"),
].map((origin) => origin.replace(/\/+$/, ""))));
const allowedOutboundDomains = getArrayEnv("ALLOWED_OUTBOUND_DOMAINS");

export const env = {
  nodeEnv,
  isProduction,
  port: getNumberEnv("PORT", 3001),
  databaseUrl,
  googleClientId: getEnv("GOOGLE_CLIENT_ID"),
  jwtSecret: getEnv("JWT_SECRET"),
  jwtRefreshSecret: getEnv("JWT_REFRESH_SECRET"),
  accessTokenExpiresIn: process.env.JWT_EXPIRES_IN ?? "15d",
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
  redisUrl: getOptionalEnv("REDIS_URL"),
  authUserCacheTtlSeconds: getNumberEnv("AUTH_USER_CACHE_TTL_SECONDS", 300),
  frontendOrigins,
  allowedOutboundDomains,
  trustProxy: getBooleanEnv("TRUST_PROXY", isProduction),
  logLevel: process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
  cloudinaryCloudName: getOptionalEnv("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: getOptionalEnv("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: getOptionalEnv("CLOUDINARY_API_SECRET"),
  rateLimitWindowMs: getNumberEnv("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  rateLimitMaxRequests: getNumberEnv("RATE_LIMIT_MAX_REQUESTS", 200),
  authRateLimitWindowMs: getNumberEnv("AUTH_RATE_LIMIT_WINDOW_MS", 10 * 60 * 1000),
  authRateLimitMaxRequests: getNumberEnv("AUTH_RATE_LIMIT_MAX_REQUESTS", 5),
  shutdownTimeoutMs: getNumberEnv("SHUTDOWN_TIMEOUT_MS", 10_000),
  razorpayKeyId: getEnv("RAZORPAY_KEY_ID"),
  razorpayKeySecret: getEnv("RAZORPAY_KEY_SECRET"),
  razorpayWebhookSecret: getOptionalEnv("RAZORPAY_WEBHOOK_SECRET"),
};

