import { bearerAuth, jsonRef, pathParam } from "./helpers";

export const wishlistPaths = {
  "/api/v1/wishlist": {
    get: {
      tags: ["Wishlist"],
      operationId: "getWishlist",
      summary: "Get the authenticated user's wishlist",
      description:
        "Returns all products in the user's wishlist with enriched product details including name, image, pricing, stock status, and product badges.",
      security: bearerAuth,
      responses: {
        "200": {
          description: "Wishlist fetched successfully",
          content: jsonRef("#/components/schemas/WishlistListResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/wishlist/{productId}": {
    post: {
      tags: ["Wishlist"],
      operationId: "toggleWishlistProduct",
      summary: "Toggle a product in the wishlist",
      description:
        "Adds a product to the wishlist if not already present, or removes it if it is. Returns the action taken (added/removed).",
      security: bearerAuth,
      parameters: [pathParam("productId", { type: "integer" }, "Product ID")],
      responses: {
        "200": {
          description: "Product removed from wishlist",
          content: jsonRef("#/components/schemas/WishlistToggleResponse"),
        },
        "201": {
          description: "Product added to wishlist",
          content: jsonRef("#/components/schemas/WishlistToggleResponse"),
        },
        "400": {
          description: "Product is unavailable",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Product not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    delete: {
      tags: ["Wishlist"],
      operationId: "removeWishlistProduct",
      summary: "Remove a product from the wishlist",
      description: "Explicitly removes a product from the authenticated user's wishlist.",
      security: bearerAuth,
      parameters: [pathParam("productId", { type: "integer" }, "Product ID")],
      responses: {
        "200": {
          description: "Product removed from wishlist",
          content: jsonRef("#/components/schemas/DeleteResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Product not in wishlist",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
};
