import { bearerAuth, jsonRef, pathParam } from "./helpers";

export const categoryPaths = {
  "/api/v1/categories": {
    get: {
      tags: ["Categories"],
      operationId: "listCategories",
      summary: "List all active categories with subcategories",
      responses: {
        "200": {
          description: "Categories fetched successfully",
          content: jsonRef("#/components/schemas/CategoryListResponse"),
        },
      },
    },
    post: {
      tags: ["Categories"],
      operationId: "createCategory",
      summary: "Create a new category",
      security: bearerAuth,
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/CreateCategoryRequest"),
      },
      responses: {
        "201": {
          description: "Category created successfully",
          content: jsonRef("#/components/schemas/CategoryMutationResponse"),
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
          description: "Forbidden",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "409": {
          description: "Conflict",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/categories/{id}": {
    get: {
      tags: ["Categories"],
      operationId: "getCategoryById",
      summary: "Get a single category by ID",
      parameters: [pathParam("id", { type: "integer" })],
      responses: {
        "200": {
          description: "Category fetched successfully",
          content: jsonRef("#/components/schemas/CategoryResponse"),
        },
        "404": {
          description: "Category not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    put: {
      tags: ["Categories"],
      operationId: "updateCategoryById",
      summary: "Update an existing category",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" })],
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/UpdateCategoryRequest"),
      },
      responses: {
        "200": {
          description: "Category updated successfully",
          content: jsonRef("#/components/schemas/CategoryMutationResponse"),
        },
        "400": {
          description: "Validation or business rule error",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Category not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "409": {
          description: "Conflict",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    delete: {
      tags: ["Categories"],
      operationId: "deleteCategoryById",
      summary: "Deactivate a category and its related catalog entries",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" })],
      responses: {
        "200": {
          description: "Category deleted successfully",
          content: jsonRef("#/components/schemas/DeleteResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Category not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/categories/slug/{slug}": {
    get: {
      tags: ["Categories"],
      operationId: "getCategoryBySlug",
      summary: "Get a single category by slug",
      parameters: [pathParam("slug", { type: "string" })],
      responses: {
        "200": {
          description: "Category fetched successfully",
          content: jsonRef("#/components/schemas/CategoryResponse"),
        },
        "404": {
          description: "Category not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
};
