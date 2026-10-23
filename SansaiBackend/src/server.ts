import "./config/egress";
import { Server } from "http";
import app from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { closeRedisClient, getRedisClient, isRedisConfigured } from "./config/redis";
import { prisma } from "./prisma/prisma";

const PORT = env.port;
let server: Server | null = null;
let isShuttingDown = false;

async function startServer(): Promise<void> {
  try {
    try {
      await prisma.$queryRaw`SELECT 1`;
      logger.info("✅ Database connected successfully");
    } catch (error) {
      logger.fatal({ err: error }, "failed to verify database connection");
      process.exit(1);
    }

    if (isRedisConfigured) {
      const redis = await getRedisClient();

      if (redis) {
        logger.info("✅ Redis connected successfully");
      } else {
        logger.warn(
          "redis is configured but unavailable, continuing with database-backed auth state"
        );
      }
    }

    server = app.listen(PORT, () => {
      logger.info(
        {
          port: PORT,
          docsPath: "/api/v1/docs",
        },
        `🚀 Server is running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    logger.fatal({ err: error }, "failed to start server");
    process.exit(1);
  }
}

const closeHttpServer = async (): Promise<void> => {
  if (!server) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    server!.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });

    server?.closeIdleConnections?.();
  });
};

const shutdown = async (signal: string, exitCode = 0): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  app.locals.isShuttingDown = true;

  logger.info({ signal }, "starting graceful shutdown");

  const forcedShutdownTimer = setTimeout(() => {
    logger.error(
      { timeoutMs: env.shutdownTimeoutMs },
      "graceful shutdown timed out, forcing connections closed"
    );
    server?.closeAllConnections?.();
    process.exit(1);
  }, env.shutdownTimeoutMs);

  forcedShutdownTimer.unref();

  try {
    await closeHttpServer();
    await Promise.allSettled([prisma.$disconnect(), closeRedisClient()]);
    clearTimeout(forcedShutdownTimer);
    logger.info("graceful shutdown completed");
    process.exit(exitCode);
  } catch (error) {
    clearTimeout(forcedShutdownTimer);
    logger.fatal({ err: error }, "graceful shutdown failed");
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "unhandled promise rejection");
  void shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "uncaught exception");
  void shutdown("uncaughtException", 1);
});

void startServer();
