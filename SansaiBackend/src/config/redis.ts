import { createClient } from "redis";
import { env } from "./env";
import { logger } from "./logger";

type RedisConnection = ReturnType<typeof createClient>;

let redisClient: RedisConnection | null = null;
let redisConnectPromise: Promise<RedisConnection | null> | null = null;
let hasLoggedRedisFailure = false;

export const isRedisConfigured = Boolean(env.redisUrl);

const createRedisConnection = async (): Promise<RedisConnection | null> => {
  if (!env.redisUrl) {
    return null;
  }

  const client = createClient({
    url: env.redisUrl,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    },
  });

  client.on("error", (error) => {
    if (!hasLoggedRedisFailure) {
      logger.warn(
        { err: error },
        "redis connection error, falling back to database-only auth state"
      );
      hasLoggedRedisFailure = true;
    }
  });

  try {
    await client.connect();
    hasLoggedRedisFailure = false;
    redisClient = client;
    return client;
  } catch (error) {
    if (!hasLoggedRedisFailure) {
      logger.warn({ err: error }, "redis is unavailable, continuing without cache");
      hasLoggedRedisFailure = true;
    }

    try {
      await client.disconnect();
    } catch {
      // Ignore disconnect failures on partially opened clients.
    }

    return null;
  } finally {
    redisConnectPromise = null;
  }
};

export const getRedisClient = async (): Promise<RedisConnection | null> => {
  if (!env.redisUrl) {
    return null;
  }

  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (!redisConnectPromise) {
    redisConnectPromise = createRedisConnection();
  }

  return redisConnectPromise;
};

export const closeRedisClient = async (): Promise<void> => {
  if (!redisClient?.isOpen) {
    return;
  }

  await redisClient.quit();
  redisClient = null;
};
