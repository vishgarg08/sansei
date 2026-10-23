import { bearerAuth, jsonRef, pathParam } from "./helpers";

export const couponPaths = {
  "/api/v1/coupons/apply": {
    post: {
      tags: ["Coupons"],
      operationId: "applyCoupon",
      summary: "Apply a coupon to checkout",
      description:
        "Validates a coupon code against active status, expiry, minimum order amount, total usage limits, and user usage limits. Returns the calculated discount and final amount.",
      security: bearerAuth,
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/ApplyCouponRequest"),
      },
      responses: {
        "200": {
          description: "Coupon applied successfully",
          content: jsonRef("#/components/schemas/ApplyCouponResponse"),
        },
        "400": {
          description: "Validation error or invalid coupon (expired, low amount, limits exceeded)",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Coupon not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/coupons": {
    post: {
      tags: ["Coupons"],
      operationId: "createCoupon",
      summary: "Create a new coupon (Admin)",
      description: "Creates a new coupon. Admin authorization required.",
      security: bearerAuth,
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/CreateCouponRequest"),
      },
      responses: {
        "201": {
          description: "Coupon created successfully",
          content: jsonRef("#/components/schemas/CouponMutationResponse"),
        },
        "400": {
          description: "Validation error",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden - Admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "409": {
          description: "Coupon code already exists",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    get: {
      tags: ["Coupons"],
      operationId: "getCoupons",
      summary: "List all coupons (Admin)",
      description: "Retrieves all coupons in the system. Admin authorization required.",
      security: bearerAuth,
      responses: {
        "200": {
          description: "Coupons list retrieved successfully",
          content: jsonRef("#/components/schemas/CouponListResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden - Admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/coupons/{id}": {
    get: {
      tags: ["Coupons"],
      operationId: "getCouponById",
      summary: "Get coupon details by ID (Admin)",
      description: "Retrieves details of a specific coupon. Admin authorization required.",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Coupon ID")],
      responses: {
        "200": {
          description: "Coupon details retrieved successfully",
          content: jsonRef("#/components/schemas/CouponResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden - Admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Coupon not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    patch: {
      tags: ["Coupons"],
      operationId: "updateCoupon",
      summary: "Update coupon details (Admin)",
      description: "Modifies an existing coupon. Admin authorization required.",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Coupon ID")],
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/UpdateCouponRequest"),
      },
      responses: {
        "200": {
          description: "Coupon updated successfully",
          content: jsonRef("#/components/schemas/CouponMutationResponse"),
        },
        "400": {
          description: "Validation error",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden - Admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Coupon not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    delete: {
      tags: ["Coupons"],
      operationId: "deleteCoupon",
      summary: "Delete a coupon (Admin)",
      description: "Permanently deletes a coupon. Admin authorization required.",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Coupon ID")],
      responses: {
        "200": {
          description: "Coupon deleted successfully",
          content: jsonRef("#/components/schemas/DeleteResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden - Admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Coupon not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
};
