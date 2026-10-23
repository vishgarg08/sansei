import {
  AuthProvider,
  Prisma,
  PrismaClient,
  Role,
  TokenType,
} from "@prisma/client";
import { env } from "../config/env";
import { getRedisClient } from "../config/redis";
import { prisma } from "../prisma/prisma";

import {
  AuthUserCache,
  RefreshTokenState,
  SessionState,
} from "../types/auth";
import { DbClient } from "../types/prisma";

const authUserCacheKey = (userId: number): string => `auth:user:${userId}`;
const sessionCacheKey = (sessionId: string): string => `auth:session:${sessionId}`;
const refreshTokenCacheKey = (tokenHash: string): string =>
  `auth:refresh-token:${tokenHash}`;

const getSecondsUntil = (expiresAt: Date): number =>
  Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000));

const getJson = async <T>(key: string): Promise<T | null> => {
  const redis = await getRedisClient();

  if (!redis) {
    return null;
  }

  const value = await redis.get(key);

  if (!value) {
    return null;
  }

  return JSON.parse(value) as T;
};

const setJson = async (
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> => {
  const redis = await getRedisClient();

  if (!redis) {
    return;
  }

  await redis.set(key, JSON.stringify(value), {
    EX: ttlSeconds,
  });
};

const deleteKey = async (key: string): Promise<void> => {
  const redis = await getRedisClient();

  if (!redis) {
    return;
  }

  await redis.del(key);
};

export const cacheAuthUserSummary = async (user: {
  id: number;
  email: string;
  role: Role;
  provider: AuthProvider;
  isActive: boolean;
  deletedAt: Date | null;
}): Promise<void> => {
  await setJson(authUserCacheKey(user.id), {
    id: user.id,
    email: user.email,
    role: user.role,
    provider: user.provider,
    isActive: user.isActive,
    deletedAt: user.deletedAt?.toISOString() ?? null,
  } satisfies AuthUserCache, env.authUserCacheTtlSeconds);
};

export const invalidateAuthUserSummary = async (userId: number): Promise<void> =>
  deleteKey(authUserCacheKey(userId));

export const getAuthUserSummary = async (
  userId: number
): Promise<AuthUserCache | null> => {
  const cachedUser = await getJson<AuthUserCache>(authUserCacheKey(userId));

  if (cachedUser) {
    return cachedUser;
  }

  const user = await prisma.auth.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      provider: true,
      isActive: true,
      deletedAt: true,
    },
  });

  if (!user) {
    return null;
  }

  await cacheAuthUserSummary(user);

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    provider: user.provider,
    isActive: user.isActive,
    deletedAt: user.deletedAt?.toISOString() ?? null,
  };
};

export const cacheSessionState = async (session: {
  id: string;
  userId: number;
  refreshToken: string;
  isActive: boolean;
  expiresAt: Date;
  userRole: Role;
  userIsActive: boolean;
  userDeletedAt: Date | null;
}): Promise<void> => {
  await setJson(sessionCacheKey(session.id), {
    id: session.id,
    userId: session.userId,
    refreshToken: session.refreshToken,
    isActive: session.isActive,
    expiresAt: session.expiresAt.toISOString(),
    userRole: session.userRole,
    userIsActive: session.userIsActive,
    userDeletedAt: session.userDeletedAt?.toISOString() ?? null,
  } satisfies SessionState, getSecondsUntil(session.expiresAt));
};

export const invalidateSessionState = async (sessionId: string): Promise<void> =>
  deleteKey(sessionCacheKey(sessionId));

export const getSessionState = async (
  sessionId: string
): Promise<SessionState | null> => {
  const cachedSession = await getJson<SessionState>(sessionCacheKey(sessionId));

  if (cachedSession) {
    return cachedSession;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          role: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  await cacheSessionState({
    id: session.id,
    userId: session.userId,
    refreshToken: session.refreshToken,
    isActive: session.isActive,
    expiresAt: session.expiresAt,
    userRole: session.user.role,
    userIsActive: session.user.isActive,
    userDeletedAt: session.user.deletedAt,
  });

  return {
    id: session.id,
    userId: session.userId,
    refreshToken: session.refreshToken,
    isActive: session.isActive,
    expiresAt: session.expiresAt.toISOString(),
    userRole: session.user.role,
    userIsActive: session.user.isActive,
    userDeletedAt: session.user.deletedAt?.toISOString() ?? null,
  };
};

export const cacheRefreshTokenState = async (token: {
  token: string;
  userId: number;
  tokenType: TokenType;
  expiresAt: Date;
  isRevoked: boolean;
}): Promise<void> => {
  await setJson(refreshTokenCacheKey(token.token), {
    token: token.token,
    userId: token.userId,
    tokenType: token.tokenType,
    expiresAt: token.expiresAt.toISOString(),
    isRevoked: token.isRevoked,
  } satisfies RefreshTokenState, getSecondsUntil(token.expiresAt));
};

export const invalidateRefreshTokenState = async (
  tokenHash: string
): Promise<void> => deleteKey(refreshTokenCacheKey(tokenHash));

export const getRefreshTokenState = async (
  tokenHash: string
): Promise<RefreshTokenState | null> => {
  const cachedToken = await getJson<RefreshTokenState>(
    refreshTokenCacheKey(tokenHash)
  );

  if (cachedToken) {
    return cachedToken;
  }

  const token = await prisma.token.findFirst({
    where: {
      token: tokenHash,
      tokenType: TokenType.REFRESH,
    },
  });

  if (!token) {
    return null;
  }

  await cacheRefreshTokenState(token);

  return {
    token: token.token,
    userId: token.userId,
    tokenType: token.tokenType,
    expiresAt: token.expiresAt.toISOString(),
    isRevoked: token.isRevoked,
  };
};

export const revokeRefreshTokenRecord = async (
  client: DbClient,
  tokenHash: string
): Promise<void> => {
  await client.token.updateMany({
    where: {
      token: tokenHash,
      tokenType: TokenType.REFRESH,
      isRevoked: false,
    },
    data: {
      isRevoked: true,
    },
  });

  await invalidateRefreshTokenState(tokenHash);
};

export const storeRefreshTokenRecord = async (
  client: DbClient,
  input: {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
  }
): Promise<void> => {
  await client.token.create({
    data: {
      userId: input.userId,
      token: input.tokenHash,
      tokenType: TokenType.REFRESH,
      expiresAt: input.expiresAt,
    },
  });

  await cacheRefreshTokenState({
    token: input.tokenHash,
    userId: input.userId,
    tokenType: TokenType.REFRESH,
    expiresAt: input.expiresAt,
    isRevoked: false,
  });
};
