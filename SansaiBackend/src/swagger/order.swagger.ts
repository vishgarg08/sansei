import { bearerAuth, jsonRef, pathParam, queryParam } from "./helpers";

export const orderPaths = {
  "/api/v1/orders": {
    get: {
      operationId: "getOrders",
      summary: "List customer orders",
      description: "Returns paginated list of orders for the authenticated customer.",
      tags: ["Orders"],
      security: bearerAuth,
      parameters: [
        queryParam("page", { type: "integer", default: 1, minimum: 1 }),
        queryParam("limit", { type: "integer", default: 10, minimum: 1, maximum: 50 }),
        queryParam("status", {
          type: "string",
          enum: [
            "PENDING", "CONFIRMED", "PACKED", "SHIPPED",
            "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
            "RETURN_REQUESTED", "RETURNED",
          ],
        }),
      ],
      responses: {
        "200": {
          description: "List of orders",
          content: jsonRef("#/components/schemas/OrderListResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/orders/{id}": {
    get: {
      operationId: "getOrderById",
      summary: "Get order details",
      description:
        "Returns full order details including items, timeline, payment, and address.",
      tags: ["Orders"],
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Order ID")],
      responses: {
        "200": {
          description: "Order details",
          content: jsonRef("#/components/schemas/OrderDetailResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Order not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/orders/{id}/cancel": {
    post: {
      operationId: "cancelOrder",
      summary: "Cancel an order",
      description:
        "Cancels a PENDING or CONFIRMED order. Releases reserved stock or restores actual stock depending on payment status.",
      tags: ["Orders"],
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Order ID")],
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/CancelOrderRequest"),
      },
      responses: {
        "200": {
          description: "Order cancelled successfully",
          content: jsonRef("#/components/schemas/CancelOrderResponse"),
        },
        "400": {
          description: "Order cannot be cancelled",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Order not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
};
