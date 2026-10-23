import { bearerAuth, jsonRef, pathParam } from "./helpers";

export const variantPaths = {
  "/api/v1/products/{productId}/variants": {
    get: {
      tags: ["Variants"],
      operationId: "listProductVariants",
      summary: "List all variants for a product",
      description: "Returns all variants (size, color, SKU, stock) for the specified product.",
      security: bearerAuth,
      parameters: [
        pathParam("productId", { type: "integer" }, "Product id"),
      ],
      responses: {
        "200": {
          description: "Variants fetched successfully",
          content: jsonRef("#/components/schemas/VariantListResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Product not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    post: {
      tags: ["Variants"],
      operationId: "createProductVariants",
      summary: "Add one or more variants to a product",
      description: "Creates variants with optional initial stock. Automatically logs initial stock in the inventory log.",
      security: bearerAuth,
      parameters: [
        pathParam("productId", { type: "integer" }, "Product id"),
      ],
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/CreateVariantsRequest"),
      },
      responses: {
        "201": {
          description: "Variants created successfully",
          content: jsonRef("#/components/schemas/VariantMutationResponse"),
        },
        "400": {
          description: "Validation failed or duplicate SKU/combination",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Product not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "409": {
          description: "SKU or size+color combination conflict",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/products/{productId}/variants/stock-summary": {
    get: {
      tags: ["Variants"],
      operationId: "getProductStockSummary",
      summary: "Get stock summary dashboard for a product",
      description: "Returns aggregate stock data (total, reserved, available) for all variants. Uses Raw SQL for optimized aggregation.",
      security: bearerAuth,
      parameters: [
        pathParam("productId", { type: "integer" }, "Product id"),
      ],
      responses: {
        "200": {
          description: "Stock summary fetched successfully",
          content: jsonRef("#/components/schemas/ProductStockSummaryResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Product not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/products/{productId}/variants/bulk-stock": {
    put: {
      tags: ["Variants"],
      operationId: "bulkUpdateProductStock",
      summary: "Bulk update stock for multiple variants",
      description: "Atomically updates stock for multiple variants in a single transaction. Each update creates an inventory log entry.",
      security: bearerAuth,
      parameters: [
        pathParam("productId", { type: "integer" }, "Product id"),
      ],
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/BulkStockUpdateRequest"),
      },
      responses: {
        "200": {
          description: "Bulk stock update completed successfully",
          content: jsonRef("#/components/schemas/VariantMutationResponse"),
        },
        "400": {
          description: "Validation failed, insufficient stock, or duplicate variant ids",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Product or variant not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/products/{productId}/variants/{variantId}": {
    get: {
      tags: ["Variants"],
      operationId: "getVariantById",
      summary: "Get a single variant by id",
      security: bearerAuth,
      parameters: [
        pathParam("productId", { type: "integer" }, "Product id"),
        pathParam("variantId", { type: "integer" }, "Variant id"),
      ],
      responses: {
        "200": {
          description: "Variant fetched successfully",
          content: jsonRef("#/components/schemas/SingleVariantResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Product or variant not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    put: {
      tags: ["Variants"],
      operationId: "updateVariantById",
      summary: "Update a variant",
      description: "Update size, color, SKU, price, or stock. Stock changes are automatically logged in the inventory log.",
      security: bearerAuth,
      parameters: [
        pathParam("productId", { type: "integer" }, "Product id"),
        pathParam("variantId", { type: "integer" }, "Variant id"),
      ],
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/UpdateVariantRequest"),
      },
      responses: {
        "200": {
          description: "Variant updated successfully",
          content: jsonRef("#/components/schemas/SingleVariantMutationResponse"),
        },
        "400": {
          description: "Validation failed",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Product or variant not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "409": {
          description: "SKU or size+color combination conflict",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    delete: {
      tags: ["Variants"],
      operationId: "deleteVariantById",
      summary: "Delete a variant",
      description: "Removes a variant. Fails if the variant is referenced by existing cart items or orders.",
      security: bearerAuth,
      parameters: [
        pathParam("productId", { type: "integer" }, "Product id"),
        pathParam("variantId", { type: "integer" }, "Variant id"),
      ],
      responses: {
        "200": {
          description: "Variant deleted successfully",
          content: jsonRef("#/components/schemas/DeleteResponse"),
        },
        "400": {
          description: "Variant is referenced and cannot be deleted",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Product or variant not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/products/{productId}/variants/{variantId}/stock": {
    put: {
      tags: ["Variants"],
      operationId: "updateVariantStock",
      summary: "Update stock for a single variant",
      description: "Adjusts variant stock by action type (IN, OUT, RETURN, CANCELLED, MANUAL). Creates an inventory log entry.",
      security: bearerAuth,
      parameters: [
        pathParam("productId", { type: "integer" }, "Product id"),
        pathParam("variantId", { type: "integer" }, "Variant id"),
      ],
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/UpdateStockRequest"),
      },
      responses: {
        "200": {
          description: "Stock updated successfully",
          content: jsonRef("#/components/schemas/SingleVariantMutationResponse"),
        },
        "400": {
          description: "Insufficient stock or validation error",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Product or variant not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
};
