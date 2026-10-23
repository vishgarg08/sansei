import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { createHash, randomUUID } from "crypto";
import { env } from "../config/env";

type TokenKind = "access" | "refresh";

type BaseTokenPayload = JwtPayload & {
  sub: string;
  role: Role;
  sessionId: string;
  type: TokenKind;
};

const ACCESS_TOKEN_OPTIONS: SignOptions = {
  expiresIn: env.accessTokenExpiresIn as SignOptions["expiresIn"],
};

const REFRESH_TOKEN_OPTIONS: SignOptions = {
  expiresIn: env.refreshTokenExpiresIn as SignOptions["expiresIn"],
};

export const hashPassword = async (password: string): Promise<string> =>
  bcrypt.hash(password, 12);

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => bcrypt.compare(password, hash);

export const hashToken = (value: string): string =>
  createHash("sha256").update(value).digest("hex");

export const signAccessToken = (payload: {
  userId: number;
  role: Role;
  sessionId: string;
}): string =>
  jwt.sign(
    {
      sub: String(payload.userId),
      jti: randomUUID(),
      role: payload.role,
      sessionId: payload.sessionId,
      type: "access",
    },
    env.jwtSecret,
    ACCESS_TOKEN_OPTIONS
  );

export const signRefreshToken = (payload: {
  userId: number;
  role: Role;
  sessionId: string;
}): string =>
  jwt.sign(
    {
      sub: String(payload.userId),
      jti: randomUUID(),
      role: payload.role,
      sessionId: payload.sessionId,
      type: "refresh",
    },
    env.jwtRefreshSecret,
    REFRESH_TOKEN_OPTIONS
  );

const assertTokenPayload = (
  payload: string | JwtPayload,
  expectedType: TokenKind
): BaseTokenPayload => {
  if (typeof payload === "string") {
    throw new Error("Invalid token payload");
  }

  if (
    typeof payload.sub !== "string" ||
    typeof payload.sessionId !== "string" ||
    (payload.type !== "access" && payload.type !== "refresh") ||
    payload.type !== expectedType
  ) {
    throw new Error("Invalid token payload");
  }

  return payload as BaseTokenPayload;
};

export const verifyAccessToken = (token: string): BaseTokenPayload =>
  assertTokenPayload(jwt.verify(token, env.jwtSecret), "access");

export const verifyRefreshToken = (token: string): BaseTokenPayload =>
  assertTokenPayload(jwt.verify(token, env.jwtRefreshSecret), "refresh");

export const getTokenExpiryDate = (token: string): Date => {
  const decoded = jwt.decode(token);

  if (!decoded || typeof decoded === "string" || !decoded.exp) {
    throw new Error("Unable to decode token expiry");
  }

  return new Date(decoded.exp * 1000);
};
