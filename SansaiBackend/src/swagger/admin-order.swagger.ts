import { bearerAuth, jsonRef, pathParam, queryParam } from "./helpers";

export const adminOrderPaths = {
  "/api/v1/admin/orders": {
    get: {
      operationId: "getAdminOrders",
      summary: "List all orders (Admin)",
      description:
        "Returns paginated list of all orders with filtering by status, payment status, user, and search.",
      tags: ["Admin Orders"],
      security: bearerAuth,
      parameters: [
        queryParam("page", { type: "integer", default: 1, minimum: 1 }),
        queryParam("limit", { type: "integer", default: 20, minimum: 1, maximum: 100 }),
        queryParam("status", {
          type: "string",
          enum: [
            "PENDING", "CONFIRMED", "PACKED", "SHIPPED",
            "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
            "RETURN_REQUESTED", "RETURNED",
          ],
        }),
        queryParam("paymentStatus", {
          type: "string",
          enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
        }),
        queryParam("userId", { type: "integer" }, "Filter by customer ID"),
        queryParam("search", { type: "string" }, "Search by order number, customer name, or email"),
      ],
      responses: {
        "200": {
          description: "List of all orders",
          content: jsonRef("#/components/schemas/AdminOrderListResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden - Admin only",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/admin/orders/{id}": {
    get: {
      operationId: "getAdminOrderById",
      summary: "Get order details (Admin)",
      description:
        "Returns full order details including customer info, items, timeline, payment, and address.",
      tags: ["Admin Orders"],
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Order ID")],
      responses: {
        "200": {
          description: "Order details for admin",
          content: jsonRef("#/components/schemas/AdminOrderDetailResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden - Admin only",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Order not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/admin/orders/{id}/status": {
    patch: {
      operationId: "updateOrderStatus",
      summary: "Update order status (Admin)",
      description:
        "Updates order status with validated transitions. Automatically creates a timeline entry with admin ID. Handles stock restoration on cancellation.",
      tags: ["Admin Orders"],
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Order ID")],
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/AdminUpdateStatusRequest"),
      },
      responses: {
        "200": {
          description: "Order status updated",
          content: jsonRef("#/components/schemas/AdminOrderDetailResponse"),
        },
        "400": {
          description: "Invalid status transition",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden - Admin only",
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
