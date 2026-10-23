import { bearerAuth, jsonRef, pathParam, queryParam } from "./helpers";

export const subCategoryPaths = {
  "/api/v1/categories/{categoryId}/subcategories": {
    get: {
      tags: ["Subcategories"],
      operationId: "listSubcategoriesByCategory",
      summary: "List all active subcategories for a category",
      parameters: [pathParam("categoryId", { type: "integer" })],
      responses: {
        "200": {
          description: "Subcategories fetched successfully",
          content: jsonRef("#/components/schemas/SubCategoryListResponse"),
        },
        "404": {
          description: "Category not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/subcategories": {
    get: {
      tags: ["Subcategories"],
      operationId: "listSubcategories",
      summary: "List all active subcategories",
      parameters: [
        queryParam("categoryId", { type: "integer" }, "Filter by category id"),
      ],
      responses: {
        "200": {
          description: "Subcategories fetched successfully",
          content: jsonRef("#/components/schemas/SubCategoryListResponse"),
        },
      },
    },
    post: {
      tags: ["Subcategories"],
      operationId: "createSubcategory",
      summary: "Create a new subcategory",
      security: bearerAuth,
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/CreateSubCategoryRequest"),
      },
      responses: {
        "201": {
          description: "Subcategory created successfully",
          content: jsonRef("#/components/schemas/SubCategoryMutationResponse"),
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
  },
  "/api/v1/subcategories/{id}": {
    get: {
      tags: ["Subcategories"],
      operationId: "getSubcategoryById",
      summary: "Get a single subcategory by ID",
      parameters: [pathParam("id", { type: "integer" })],
      responses: {
        "200": {
          description: "Subcategory fetched successfully",
          content: jsonRef("#/components/schemas/SubCategoryResponse"),
        },
        "404": {
          description: "Subcategory not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    put: {
      tags: ["Subcategories"],
      operationId: "updateSubcategoryById",
      summary: "Update an existing subcategory",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" })],
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/UpdateSubCategoryRequest"),
      },
      responses: {
        "200": {
          description: "Subcategory updated successfully",
          content: jsonRef("#/components/schemas/SubCategoryMutationResponse"),
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
          description: "Subcategory or category not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "409": {
          description: "Conflict",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    delete: {
      tags: ["Subcategories"],
      operationId: "deleteSubcategoryById",
      summary: "Deactivate a subcategory and its related products",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" })],
      responses: {
        "200": {
          description: "Subcategory deleted successfully",
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
          description: "Subcategory not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/subcategories/slug/{slug}": {
    get: {
      tags: ["Subcategories"],
      operationId: "getSubcategoryBySlug",
      summary: "Get a single subcategory by slug",
      parameters: [pathParam("slug", { type: "string" })],
      responses: {
        "200": {
          description: "Subcategory fetched successfully",
          content: jsonRef("#/components/schemas/SubCategoryResponse"),
        },
        "404": {
          description: "Subcategory not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
};
