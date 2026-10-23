import {
  AuthProvider,
  Prisma,
  PrismaClient,
  Role,
} from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import { randomUUID } from "crypto";
import { prisma } from "../prisma/prisma";
import { env } from "../config/env";
import {
  cacheAuthUserSummary,
  cacheSessionState,
  getRefreshTokenState,
  getSessionState,
  invalidateSessionState,
  revokeRefreshTokenRecord,
  storeRefreshTokenRecord,
} from "./auth-state.service";
import { AppError } from "../utils/appError";
import {
  comparePassword,
  getTokenExpiryDate,
  hashPassword,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/auth";
import {
  AuthResponse,
  AuthResponseWithSession,
  AuthTokens,
  AuthUser,
  RequestContext,
  authUserSelect,
} from "../types/auth";
import { DbClient } from "../types/prisma";

const googleClient = new OAuth2Client(env.googleClientId);

const getAuthUserById = async (
  client: DbClient,
  userId: number
): Promise<AuthUser> => {
  const user = await client.auth.findUnique({
    where: { id: userId },
    select: authUserSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

const isExpired = (value: Date | string): boolean =>
  new Date(value).getTime() <= Date.now();

const toPublicAuthResponse = (
  response: AuthResponseWithSession
): AuthResponse => ({
  user: response.user,
  tokens: response.tokens,
});

const warmAuthCaches = async (
  response: AuthResponseWithSession
): Promise<void> => {
  await Promise.all([
    cacheAuthUserSummary({
      id: response.user.id,
      email: response.user.email,
      role: response.user.role,
      provider: response.user.provider,
      isActive: response.user.isActive,
      deletedAt: null,
    }),
    cacheSessionState({
      id: response.sessionId,
      userId: response.user.id,
      refreshToken: response.refreshTokenHash,
      isActive: true,
      expiresAt: response.refreshTokenExpiresAt,
      userRole: response.user.role,
      userIsActive: response.user.isActive,
      userDeletedAt: null,
    }),
  ]);
};

const createTokensForSession = async (
  client: DbClient,
  userId: number,
  role: Role,
  context: RequestContext,
  existingSessionId?: string
): Promise<{
  tokens: AuthTokens;
  sessionId: string;
  refreshTokenHash: string;
  refreshTokenExpiresAt: Date;
}> => {
  const sessionId = existingSessionId ?? randomUUID();
  const accessToken = signAccessToken({ userId, role, sessionId });
  const refreshToken = signRefreshToken({ userId, role, sessionId });
  const refreshTokenHash = hashToken(refreshToken);
  const refreshExpiresAt = getTokenExpiryDate(refreshToken);

  if (existingSessionId) {
    const existingSession = await client.session.findUnique({
      where: { id: existingSessionId },
      select: {
        refreshToken: true,
      },
    });

    if (!existingSession) {
      throw new AppError("Session not found", 401);
    }

    await revokeRefreshTokenRecord(client, existingSession.refreshToken);

    await client.session.update({
      where: { id: existingSessionId },
      data: {
        refreshToken: refreshTokenHash,
        isActive: true,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        deviceInfo: context.userAgent,
        expiresAt: refreshExpiresAt,
      },
    });
  } else {
    await client.session.create({
      data: {
        id: sessionId,
        userId,
        refreshToken: refreshTokenHash,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        deviceInfo: context.userAgent,
        isActive: true,
        expiresAt: refreshExpiresAt,
      },
    });
  }

  await storeRefreshTokenRecord(client, {
    userId,
    tokenHash: refreshTokenHash,
    expiresAt: refreshExpiresAt,
  });

  return {
    tokens: {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      accessTokenExpiresIn: env.accessTokenExpiresIn,
      refreshTokenExpiresIn: env.refreshTokenExpiresIn,
    },
    sessionId,
    refreshTokenHash,
    refreshTokenExpiresAt: refreshExpiresAt,
  };
};

const buildAuthResponse = async (
  client: DbClient,
  userId: number,
  role: Role,
  context: RequestContext,
  existingSessionId?: string
): Promise<AuthResponseWithSession> => {
  const sessionArtifacts = await createTokensForSession(
    client,
    userId,
    role,
    context,
    existingSessionId
  );
  const user = await getAuthUserById(client, userId);

  return {
    user,
    tokens: sessionArtifacts.tokens,
    sessionId: sessionArtifacts.sessionId,
    refreshTokenHash: sessionArtifacts.refreshTokenHash,
    refreshTokenExpiresAt: sessionArtifacts.refreshTokenExpiresAt,
  };
};

const findUserByEmailOrPhone = async (email: string, phone?: string) => {
  const orConditions: Prisma.AuthWhereInput[] = [{ email }];

  if (phone) {
    orConditions.push({ phone });
  }

  return prisma.auth.findFirst({
    where: {
      deletedAt: null,
      OR: orConditions,
    },
  });
};

export const registerUser = async (
  input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  },
  context: RequestContext
): Promise<AuthResponse> => {
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim();
  const existingUser = await findUserByEmailOrPhone(email, phone);

  if (existingUser?.email === email) {
    throw new AppError("An account with this email already exists", 409);
  }

  if (phone && existingUser?.phone === phone) {
    throw new AppError("An account with this phone number already exists", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const response = await prisma.$transaction(async (tx) => {
    const user = await tx.auth.create({
      data: {
        name: input.name.trim(),
        email,
        phone,
        password: passwordHash,
        provider: AuthProvider.LOCAL,
        createdIp: context.ipAddress,
        lastLoginIp: context.ipAddress,
        lastLoginAt: new Date(),
        customerProfile: {
          create: {},
        },
      },
    });

    await tx.loginActivity.create({
      data: {
        userId: user.id,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        deviceInfo: context.userAgent,
      },
    });

    return buildAuthResponse(tx, user.id, user.role, context);
  });

  await warmAuthCaches(response);

  return toPublicAuthResponse(response);
};

export const loginUser = async (
  input: {
    email: string;
    password: string;
  },
  context: RequestContext
): Promise<AuthResponse> => {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.auth.findFirst({
    where: {
      email,
      deletedAt: null,
    },
  });

  if (!user || !user.password) {
    if (user && !user.password) {
      throw new AppError(
        "This account uses social login. Please continue with Google.",
        400
      );
    }

    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account is disabled", 403);
  }

  const passwordMatches = await comparePassword(input.password, user.password);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const response = await prisma.$transaction(async (tx) => {
    await tx.auth.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: context.ipAddress,
      },
    });

    await tx.loginActivity.create({
      data: {
        userId: user.id,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        deviceInfo: context.userAgent,
      },
    });

    return buildAuthResponse(tx, user.id, user.role, context);
  });

  await warmAuthCaches(response);

  return toPublicAuthResponse(response);
};

export const loginWithGoogle = async (
  idToken: string,
  context: RequestContext
): Promise<AuthResponse> => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload?.email || !payload.sub) {
    throw new AppError("Invalid Google token payload", 401);
  }

  if (!payload.email_verified) {
    throw new AppError("Google account email is not verified", 401);
  }

  const email = payload.email.trim().toLowerCase();
  const googleId = payload.sub;

  const response = await prisma.$transaction(async (tx) => {
    let user = await tx.auth.findFirst({
      where: {
        deletedAt: null,
        OR: [{ googleId }, { email }],
      },
    });

    if (user && !user.isActive) {
      throw new AppError("This account is disabled", 403);
    }

    if (!user) {
      user = await tx.auth.create({
        data: {
          name: payload.name?.trim() || email.split("@")[0],
          email,
          provider: AuthProvider.GOOGLE,
          googleId,
          profileImage: payload.picture,
          isEmailVerified: Boolean(payload.email_verified),
          createdIp: context.ipAddress,
          lastLoginIp: context.ipAddress,
          lastLoginAt: new Date(),
          customerProfile: {
            create: {},
          },
          oauthAccounts: {
            create: {
              provider: AuthProvider.GOOGLE,
              providerAccountId: googleId,
            },
          },
        },
      });
    } else {
      user = await tx.auth.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId ?? googleId,
          profileImage: payload.picture ?? user.profileImage,
          isEmailVerified: user.isEmailVerified || Boolean(payload.email_verified),
          lastLoginAt: new Date(),
          lastLoginIp: context.ipAddress,
        },
      });

      await tx.oAuthAccount.upsert({
        where: {
          provider_providerAccountId: {
            provider: AuthProvider.GOOGLE,
            providerAccountId: googleId,
          },
        },
        update: {},
        create: {
          userId: user.id,
          provider: AuthProvider.GOOGLE,
          providerAccountId: googleId,
        },
      });

      await tx.customerProfile.upsert({
        where: {
          authId: user.id,
        },
        update: {},
        create: {
          authId: user.id,
        },
      });
    }

    await tx.loginActivity.create({
      data: {
        userId: user.id,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        deviceInfo: context.userAgent,
      },
    });

    return buildAuthResponse(tx, user.id, user.role, context);
  });

  await warmAuthCaches(response);

  return toPublicAuthResponse(response);
};

export const refreshUserToken = async (
  refreshToken: string,
  context: RequestContext
): Promise<AuthResponse> => {
  const payload = verifyRefreshToken(refreshToken);
  const userId = Number(payload.sub);
  const sessionId = payload.sessionId;
  const hashedToken = hashToken(refreshToken);

  const [sessionState, refreshTokenState] = await Promise.all([
    getSessionState(sessionId),
    getRefreshTokenState(hashedToken),
  ]);

  if (!sessionState || !sessionState.isActive || sessionState.refreshToken !== hashedToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  if (
    !refreshTokenState ||
    refreshTokenState.isRevoked ||
    refreshTokenState.userId !== userId
  ) {
    throw new AppError("Refresh token is revoked or invalid", 401);
  }

  if (isExpired(sessionState.expiresAt) || isExpired(refreshTokenState.expiresAt)) {
    await prisma.$transaction(async (tx) => {
      await tx.session.updateMany({
        where: {
          id: sessionId,
          userId,
        },
        data: {
          isActive: false,
        },
      });

      await revokeRefreshTokenRecord(tx, hashedToken);
    });

    await invalidateSessionState(sessionId);

    throw new AppError("Refresh token has expired", 401);
  }

  if (
    sessionState.userId !== userId ||
    !sessionState.userIsActive ||
    sessionState.userDeletedAt
  ) {
    throw new AppError("Session is no longer valid", 401);
  }

  const response = await prisma.$transaction(async (tx) => {
    await tx.auth.update({
      where: { id: sessionState.userId },
      data: {
        lastLoginIp: context.ipAddress,
      },
    });

    return buildAuthResponse(
      tx,
      sessionState.userId,
      sessionState.userRole,
      context,
      sessionId
    );
  });

  await warmAuthCaches(response);

  return toPublicAuthResponse(response);
};

export const logoutUser = async (refreshToken: string): Promise<void> => {
  const payload = verifyRefreshToken(refreshToken);
  const userId = Number(payload.sub);
  const refreshTokenHash = hashToken(refreshToken);

  await prisma.$transaction(async (tx) => {
    await tx.session.updateMany({
      where: {
        id: payload.sessionId,
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    await revokeRefreshTokenRecord(tx, refreshTokenHash);
  });

  await invalidateSessionState(payload.sessionId);
};

export const getCurrentUser = async (userId: number): Promise<AuthUser> => {
  const user = await getAuthUserById(prisma, userId);

  await cacheAuthUserSummary({
    id: user.id,
    email: user.email,
    role: user.role,
    provider: user.provider,
    isActive: user.isActive,
    deletedAt: null,
  });

  return user;
};
