import { bearerAuth, jsonRef } from "./helpers";

export const checkoutPaths = {
  "/api/v1/checkout": {
    post: {
      operationId: "checkout",
      summary: "Place an order from cart",
      description:
        "Validates cart, checks stock, applies coupon (optional), calculates pricing, creates order, reserves inventory, and creates Razorpay payment order.",
      tags: ["Checkout"],
      security: bearerAuth,
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/CheckoutRequest"),
      },
      responses: {
        "201": {
          description: "Order placed successfully",
          content: jsonRef("#/components/schemas/CheckoutResponse"),
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
          description: "Address not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
};
