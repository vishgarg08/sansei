import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import pino from "pino";
import { env } from "./env";

const transport = env.isProduction
  ? undefined
  : {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        singleLine: true,
      },
    };

export const logger = pino({
  level: env.logLevel,
  transport,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.body.password",
      "req.body.token",
      "req.body.refreshToken",
      "password",
      "token",
      "refreshToken",
    ],
    censor: "[Redacted]",
  },
});

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.get("x-request-id") ?? randomUUID();
  const startedAt = process.hrtime.bigint();

  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    if (env.isProduction) {
      logger.info(
        {
          requestId,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Number(durationMs.toFixed(2)),
          ip: req.ip,
        },
        "request completed"
      );
    }
  });

  next();
};
