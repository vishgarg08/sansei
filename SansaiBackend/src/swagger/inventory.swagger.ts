import { bearerAuth, jsonRef, pathParam, queryParam } from "./helpers";

export const inventoryPaths = {
  // ─── Dashboard ─────────────────────────────────────────────────────────────

  "/api/v1/admin/inventory/dashboard": {
    get: {
      operationId: "getInventoryDashboard",
      summary: "Inventory dashboard summary (Admin)",
      description:
        "Returns high-level inventory health metrics: total stock, reserved units, available units, out-of-stock and low-stock variant counts, and recent 7-day activity breakdown by action type.",
      tags: ["Admin Inventory"],
      security: bearerAuth,
      parameters: [
        queryParam(
          "threshold",
          { type: "integer", default: 10, minimum: 0 },
          "Low-stock threshold (variants at or below this count are flagged)"
        ),
      ],
      responses: {
        "200": {
          description: "Inventory dashboard data",
          content: jsonRef("#/components/schemas/InventoryDashboardResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — Admin only",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },

  // ─── Logs ──────────────────────────────────────────────────────────────────

  "/api/v1/admin/inventory/logs": {
    get: {
      operationId: "getInventoryLogs",
      summary: "Paginated inventory log history (Admin)",
      description:
        "Returns full, paginated inventory log history across all products and variants. Supports filtering by product, variant, action type, reference string, and date range. Essential for stock audit trails.",
      tags: ["Admin Inventory"],
      security: bearerAuth,
      parameters: [
        queryParam("page", { type: "integer", default: 1, minimum: 1 }),
        queryParam("limit", { type: "integer", default: 20, minimum: 1, maximum: 100 }),
        queryParam(
          "productId",
          { type: "integer" },
          "Filter logs by product ID"
        ),
        queryParam(
          "variantId",
          { type: "integer" },
          "Filter logs by variant ID"
        ),
        queryParam("action", {
          type: "string",
          enum: ["IN", "OUT", "RETURN", "CANCELLED", "MANUAL"],
        }),
        queryParam(
          "reference",
          { type: "string" },
          "Partial match on reference string (e.g. ORDER, CANCEL, PAYMENT)"
        ),
        queryParam(
          "dateFrom",
          { type: "string", format: "date-time" },
          "Start of date range (ISO 8601)"
        ),
        queryParam(
          "dateTo",
          { type: "string", format: "date-time" },
          "End of date range (ISO 8601)"
        ),
      ],
      responses: {
        "200": {
          description: "Paginated inventory logs",
          content: jsonRef("#/components/schemas/InventoryLogListResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — Admin only",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },

  // ─── Low Stock ─────────────────────────────────────────────────────────────

  "/api/v1/admin/inventory/low-stock": {
    get: {
      operationId: "getLowStockVariants",
      summary: "Low-stock variants alert (Admin)",
      description:
        "Returns all product variants whose available stock (stock − reservedStock) is at or below the specified threshold. Use this for restocking decisions and purchase order planning.",
      tags: ["Admin Inventory"],
      security: bearerAuth,
      parameters: [
        queryParam(
          "threshold",
          { type: "integer", default: 10, minimum: 0 },
          "Flag variants with availableStock ≤ threshold"
        ),
        queryParam("page", { type: "integer", default: 1, minimum: 1 }),
        queryParam("limit", { type: "integer", default: 20, minimum: 1, maximum: 100 }),
      ],
      responses: {
        "200": {
          description: "Low-stock variants",
          content: jsonRef("#/components/schemas/LowStockResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — Admin only",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },

  // ─── Per-Variant Logs ─────────────────────────────────────────────────────

  "/api/v1/admin/inventory/products/{productId}/variants/{variantId}/logs": {
    get: {
      operationId: "getVariantInventoryLogs",
      summary: "Stock history for a specific variant (Admin)",
      description:
        "Returns the complete inventory log history for a single product variant, including current stock info. Every stock change (IN, OUT, RETURN, CANCELLED, MANUAL) is recorded here.",
      tags: ["Admin Inventory"],
      security: bearerAuth,
      parameters: [
        pathParam("productId", { type: "integer" }, "Product ID"),
        pathParam("variantId", { type: "integer" }, "Variant ID"),
        queryParam("page", { type: "integer", default: 1, minimum: 1 }),
        queryParam("limit", { type: "integer", default: 20, minimum: 1, maximum: 100 }),
      ],
      responses: {
        "200": {
          description: "Variant stock history and current stock state",
          content: jsonRef("#/components/schemas/VariantInventoryLogsResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — Admin only",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Variant not found for this product",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
};
