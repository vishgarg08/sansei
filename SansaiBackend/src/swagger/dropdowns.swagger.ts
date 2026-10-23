import { bearerAuth, jsonRef, queryParam } from "./helpers";

export const dropdownPaths = {
  "/api/v1/dropdowns/categories": {
    get: {
      tags: ["Dropdowns"],
      operationId: "getCategoriesDropdown",
      summary: "Get active categories for admin dropdowns",
      description: "Returns a lightweight list of active categories (id, name, slug) for populating admin form dropdowns.",
      security: bearerAuth,
      responses: {
        "200": {
          description: "Categories dropdown fetched successfully",
          content: jsonRef("#/components/schemas/CategoriesDropdownResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/dropdowns/subcategories": {
    get: {
      tags: ["Dropdowns"],
      operationId: "getSubCategoriesDropdown",
      summary: "Get active subcategories for admin dropdowns",
      description: "Returns subcategories filtered by optional categoryId. Only returns subcategories whose parent category is also active.",
      security: bearerAuth,
      parameters: [
        queryParam("categoryId", { type: "integer" }, "Filter subcategories by parent category id"),
      ],
      responses: {
        "200": {
          description: "Subcategories dropdown fetched successfully",
          content: jsonRef("#/components/schemas/SubCategoriesDropdownResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/dropdowns/sizes": {
    get: {
      tags: ["Dropdowns"],
      operationId: "getDistinctSizes",
      summary: "Get distinct variant sizes",
      description: "Returns all distinct size values across active product variants with in-stock count. Uses Raw SQL for performance.",
      security: bearerAuth,
      responses: {
        "200": {
          description: "Distinct sizes fetched successfully",
          content: jsonRef("#/components/schemas/DistinctValuesResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/dropdowns/colors": {
    get: {
      tags: ["Dropdowns"],
      operationId: "getDistinctColors",
      summary: "Get distinct variant colors",
      description: "Returns all distinct color values across active product variants with in-stock count. Uses Raw SQL for performance.",
      security: bearerAuth,
      responses: {
        "200": {
          description: "Distinct colors fetched successfully",
          content: jsonRef("#/components/schemas/DistinctValuesResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/dropdowns/sizes-colors": {
    get: {
      tags: ["Dropdowns"],
      operationId: "getProductSizesAndColors",
      summary: "Get sizes and colors for a specific product",
      description: "Returns distinct sizes and colors for a specific product's variants with count per value.",
      security: bearerAuth,
      parameters: [
        queryParam("productId", { type: "integer" }, "Product id to fetch sizes and colors for"),
      ],
      responses: {
        "200": {
          description: "Product sizes and colors fetched successfully",
          content: jsonRef("#/components/schemas/SizesColorsResponse"),
        },
        "400": {
          description: "Validation failed — productId is required",
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
      },
    },
  },
  "/api/v1/dropdowns/product-form-data": {
    get: {
      tags: ["Dropdowns"],
      operationId: "getProductFormData",
      summary: "Get combined form data for admin product creation",
      description: "Returns categories, subcategories (optionally filtered by categoryId), distinct sizes, and distinct colors in a single response. Optimized for admin product form hydration.",
      security: bearerAuth,
      parameters: [
        queryParam("categoryId", { type: "integer" }, "Filter subcategories by category id"),
      ],
      responses: {
        "200": {
          description: "Product form data fetched successfully",
          content: jsonRef("#/components/schemas/ProductFormDataResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden — admin access required",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
};
