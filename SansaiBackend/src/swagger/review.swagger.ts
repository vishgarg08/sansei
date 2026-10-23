import { bearerAuth, jsonRef, pathParam, queryParam } from "./helpers";

export const reviewPaths = {
  // ─── Customer: Create Review ──────────────────────────────────────────────

  "/api/v1/reviews": {
    post: {
      operationId: "createReview",
      summary: "Submit a product review",
      description:
        "Create a review for a purchased product. The `verified` flag is automatically set to `true` if the user has a DELIVERED order containing this product. Reviews are auto-approved and visible immediately.",
      tags: ["Reviews"],
      security: bearerAuth,
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/CreateReviewRequest"),
      },
      responses: {
        "201": {
          description: "Review submitted successfully",
          content: jsonRef("#/components/schemas/ReviewResponse"),
        },
        "400": { description: "Validation error", content: jsonRef("#/components/schemas/ErrorResponse") },
        "401": { description: "Unauthorized", content: jsonRef("#/components/schemas/ErrorResponse") },
        "404": { description: "Product not found", content: jsonRef("#/components/schemas/ErrorResponse") },
        "409": { description: "Already reviewed this product", content: jsonRef("#/components/schemas/ErrorResponse") },
      },
    },
  },

  "/api/v1/reviews/{id}": {
    put: {
      operationId: "updateReview",
      summary: "Update own review",
      description: "Update your own review. The review remains approved and visible immediately after editing.",
      tags: ["Reviews"],
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Review ID")],
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/UpdateReviewRequest"),
      },
      responses: {
        "200": { description: "Review updated", content: jsonRef("#/components/schemas/ReviewResponse") },
        "400": { description: "Validation error", content: jsonRef("#/components/schemas/ErrorResponse") },
        "401": { description: "Unauthorized", content: jsonRef("#/components/schemas/ErrorResponse") },
        "404": { description: "Review not found", content: jsonRef("#/components/schemas/ErrorResponse") },
      },
    },
    delete: {
      operationId: "deleteReview",
      summary: "Delete own review",
      description: "Permanently delete your own review. Product average rating is recalculated.",
      tags: ["Reviews"],
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Review ID")],
      responses: {
        "200": { description: "Review deleted", content: jsonRef("#/components/schemas/SuccessMessageResponse") },
        "401": { description: "Unauthorized", content: jsonRef("#/components/schemas/ErrorResponse") },
        "404": { description: "Review not found", content: jsonRef("#/components/schemas/ErrorResponse") },
      },
    },
  },

  "/api/v1/reviews/{id}/helpful": {
    post: {
      operationId: "markReviewHelpful",
      summary: "Mark review as helpful",
      description: "Increments the helpful count on an approved review.",
      tags: ["Reviews"],
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Review ID")],
      responses: {
        "200": {
          description: "Helpful count incremented",
          content: jsonRef("#/components/schemas/HelpfulResponse"),
        },
        "401": { description: "Unauthorized", content: jsonRef("#/components/schemas/ErrorResponse") },
        "404": { description: "Review not found", content: jsonRef("#/components/schemas/ErrorResponse") },
      },
    },
  },

  // ─── Public: Product Reviews ──────────────────────────────────────────────

  "/api/v1/products/{productId}/reviews": {
    get: {
      operationId: "getProductReviews",
      summary: "Get reviews for a product",
      description:
        "Returns paginated reviews for a product along with rating distribution (1–5 star breakdown). Public endpoint — no authentication required.",
      tags: ["Reviews"],
      parameters: [
        pathParam("productId", { type: "integer" }, "Product ID"),
        queryParam("page", { type: "integer", default: 1, minimum: 1 }),
        queryParam("limit", { type: "integer", default: 10, minimum: 1, maximum: 50 }),
        queryParam("rating", { type: "integer", minimum: 1, maximum: 5 }, "Filter by star rating"),
        queryParam("verified", { type: "boolean" }, "Filter by verified purchase"),
      ],
      responses: {
        "200": {
          description: "Approved reviews with rating distribution",
          content: jsonRef("#/components/schemas/ProductReviewsResponse"),
        },
        "404": { description: "Product not found", content: jsonRef("#/components/schemas/ErrorResponse") },
      },
    },
  },

  "/api/v1/products/{productId}/reviews/mine": {
    get: {
      operationId: "getMyProductReview",
      summary: "Get my review for a product",
      description: "Returns the authenticated user's own review for a specific product.",
      tags: ["Reviews"],
      security: bearerAuth,
      parameters: [pathParam("productId", { type: "integer" }, "Product ID")],
      responses: {
        "200": { description: "User's review", content: jsonRef("#/components/schemas/ReviewResponse") },
        "401": { description: "Unauthorized", content: jsonRef("#/components/schemas/ErrorResponse") },
        "404": { description: "No review found for this product", content: jsonRef("#/components/schemas/ErrorResponse") },
      },
    },
  },

  // ─── Admin: Review Management ─────────────────────────────────────────────

  "/api/v1/admin/reviews": {
    get: {
      operationId: "getAdminReviews",
      summary: "List all reviews (Admin)",
      description:
        "Returns paginated list of all reviews. Filter by product, user, rating, approval status, and verified.",
      tags: ["Admin Reviews"],
      security: bearerAuth,
      parameters: [
        queryParam("page", { type: "integer", default: 1, minimum: 1 }),
        queryParam("limit", { type: "integer", default: 20, minimum: 1, maximum: 100 }),
        queryParam("productId", { type: "integer" }, "Filter by product ID"),
        queryParam("userId", { type: "integer" }, "Filter by customer ID"),
        queryParam("rating", { type: "integer", minimum: 1, maximum: 5 }, "Filter by star rating"),
        queryParam("isApproved", { type: "boolean" }, "Filter by approval status"),
        queryParam("verified", { type: "boolean" }, "Filter by verified purchase"),
      ],
      responses: {
        "200": {
          description: "Paginated review list",
          content: jsonRef("#/components/schemas/AdminReviewListResponse"),
        },
        "401": { description: "Unauthorized", content: jsonRef("#/components/schemas/ErrorResponse") },
        "403": { description: "Forbidden — Admin only", content: jsonRef("#/components/schemas/ErrorResponse") },
      },
    },
  },

  "/api/v1/admin/reviews/{id}": {
    get: {
      operationId: "getAdminReviewById",
      summary: "Get review by ID (Admin)",
      description: "Returns full details of a single review.",
      tags: ["Admin Reviews"],
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Review ID")],
      responses: {
        "200": { description: "Review detail", content: jsonRef("#/components/schemas/ReviewResponse") },
        "401": { description: "Unauthorized", content: jsonRef("#/components/schemas/ErrorResponse") },
        "403": { description: "Forbidden — Admin only", content: jsonRef("#/components/schemas/ErrorResponse") },
        "404": { description: "Review not found", content: jsonRef("#/components/schemas/ErrorResponse") },
      },
    },
    delete: {
      operationId: "adminDeleteReview",
      summary: "Delete review (Admin)",
      description:
        "Hard-delete a review (spam/inappropriate). Product averageRating is automatically recalculated.",
      tags: ["Admin Reviews"],
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Review ID")],
      responses: {
        "200": { description: "Review deleted", content: jsonRef("#/components/schemas/SuccessMessageResponse") },
        "401": { description: "Unauthorized", content: jsonRef("#/components/schemas/ErrorResponse") },
        "403": { description: "Forbidden — Admin only", content: jsonRef("#/components/schemas/ErrorResponse") },
        "404": { description: "Review not found", content: jsonRef("#/components/schemas/ErrorResponse") },
      },
    },
  },
};
