import { bearerAuth, jsonRef } from "./helpers";

export const authPaths = {
  "/api/v1/auth/register": {
    post: {
      tags: ["Auth"],
      operationId: "registerUser",
      summary: "Register with email and password",
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/RegisterRequest"),
      },
      responses: {
        "201": {
          description: "User registered successfully",
          content: jsonRef("#/components/schemas/AuthSuccessResponse"),
        },
        "400": {
          description: "Validation failed",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/auth/login": {
    post: {
      tags: ["Auth"],
      operationId: "loginUser",
      summary: "Login with email and password",
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/LoginRequest"),
      },
      responses: {
        "200": {
          description: "User logged in successfully",
          content: jsonRef("#/components/schemas/AuthSuccessResponse"),
        },
        "400": {
          description: "Validation failed",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/auth/google": {
    post: {
      tags: ["Auth"],
      operationId: "loginWithGoogle",
      summary: "Login with Google ID token",
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/GoogleLoginRequest"),
      },
      responses: {
        "200": {
          description: "Google login successful",
          content: jsonRef("#/components/schemas/AuthSuccessResponse"),
        },
        "400": {
          description: "Validation failed",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/auth/refresh": {
    post: {
      tags: ["Auth"],
      operationId: "refreshAuthToken",
      summary: "Rotate refresh token and issue new tokens",
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/RefreshTokenRequest"),
      },
      responses: {
        "200": {
          description: "Tokens refreshed successfully",
          content: jsonRef("#/components/schemas/AuthSuccessResponse"),
        },
        "400": {
          description: "Validation failed",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/auth/logout": {
    post: {
      tags: ["Auth"],
      operationId: "logoutUser",
      summary: "Logout current session",
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/LogoutRequest"),
      },
      responses: {
        "200": {
          description: "Logged out successfully",
          content: jsonRef("#/components/schemas/DeleteResponse"),
        },
        "400": {
          description: "Validation failed",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/auth/me": {
    get: {
      tags: ["Auth"],
      operationId: "getCurrentUser",
      summary: "Get current logged-in user",
      security: bearerAuth,
      responses: {
        "200": {
          description: "Current user details",
          content: jsonRef("#/components/schemas/MeResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
};
