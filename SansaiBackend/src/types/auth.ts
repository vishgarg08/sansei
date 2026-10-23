import { AuthProvider, Prisma, Role, TokenType } from "@prisma/client";

export const authUserSelect = Prisma.validator<Prisma.AuthSelect>()({
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  provider: true,
  googleId: true,
  profileImage: true,
  isActive: true,
  isEmailVerified: true,
  createdAt: true,
  updatedAt: true,
  customerProfile: {
    select: {
      id: true,
      referralCode: true,
      totalOrders: true,
      totalSpent: true,
      walletBalance: true,
    },
  },
});

export type AuthUser = Prisma.AuthGetPayload<{
  select: typeof authUserSelect;
}>;

export type RequestContext = {
  ipAddress?: string;
  userAgent?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
};

export type AuthResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

export type AuthResponseWithSession = AuthResponse & {
  sessionId: string;
  refreshTokenHash: string;
  refreshTokenExpiresAt: Date;
};

export type AuthUserCache = {
  id: number;
  email: string;
  role: Role;
  provider: AuthProvider;
  isActive: boolean;
  deletedAt: string | null;
};

export type SessionState = {
  id: string;
  userId: number;
  refreshToken: string;
  isActive: boolean;
  expiresAt: string;
  userRole: Role;
  userIsActive: boolean;
  userDeletedAt: string | null;
};

export type RefreshTokenState = {
  token: string;
  userId: number;
  tokenType: TokenType;
  expiresAt: string;
  isRevoked: boolean;
};
