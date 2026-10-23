import { bearerAuth, jsonRef, pathParam } from "./helpers";

export const cartPaths = {
  "/api/v1/cart": {
    post: {
      tags: ["Cart"],
      operationId: "addToCart",
      summary: "Add an item to the cart",
      description:
        "Adds a product variant to the authenticated user's cart. If the same variant already exists, the quantity is incremented. Validates product active status, variant existence, and stock availability.",
      security: bearerAuth,
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/AddToCartRequest"),
      },
      responses: {
        "201": {
          description: "Item added to cart",
          content: jsonRef("#/components/schemas/CartItemMutationResponse"),
        },
        "400": {
          description: "Validation or stock error",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Product or variant not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    get: {
      tags: ["Cart"],
      operationId: "getCart",
      summary: "Get the authenticated user's cart",
      description:
        "Returns all items in the user's cart with enriched product details including name, image, pricing, size, color, stock, and cart totals.",
      security: bearerAuth,
      responses: {
        "200": {
          description: "Cart fetched successfully",
          content: jsonRef("#/components/schemas/CartResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/cart/clear": {
    delete: {
      tags: ["Cart"],
      operationId: "clearCart",
      summary: "Clear all items from the cart",
      description: "Removes all items from the authenticated user's cart.",
      security: bearerAuth,
      responses: {
        "200": {
          description: "Cart cleared",
          content: jsonRef("#/components/schemas/DeleteResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/cart/{id}": {
    patch: {
      tags: ["Cart"],
      operationId: "updateCartItem",
      summary: "Update cart item quantity",
      description:
        "Updates the quantity of a specific cart item. Validates stock availability for the new quantity.",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Cart item ID")],
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/UpdateCartItemRequest"),
      },
      responses: {
        "200": {
          description: "Cart item updated",
          content: jsonRef("#/components/schemas/CartItemMutationResponse"),
        },
        "400": {
          description: "Validation or stock error",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Cart item not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    delete: {
      tags: ["Cart"],
      operationId: "removeCartItem",
      summary: "Remove an item from the cart",
      description: "Removes a specific item from the authenticated user's cart.",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Cart item ID")],
      responses: {
        "200": {
          description: "Item removed from cart",
          content: jsonRef("#/components/schemas/DeleteResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Cart item not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
};
