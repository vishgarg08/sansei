import { bearerAuth, jsonRef, pathParam, queryParam } from "./helpers";

export const productPaths = {
  "/api/v1/products": {
    get: {
      tags: ["Products"],
      operationId: "listPublicProducts",
      summary: "List public products with pagination, filters, search, and sorting",
      parameters: [
        queryParam("page", { type: "integer", default: 1, minimum: 1 }),
        queryParam("limit", { type: "integer", default: 10, minimum: 1, maximum: 100 }),
        queryParam("search", { type: "string" }, "Search by name, slug, SKU, brand, or description"),
        queryParam("categoryId", { type: "integer" }, "Filter by category id"),
        queryParam("category", { type: "string" }, "Filter by category slug or name"),
        queryParam("subCategoryId", { type: "integer" }, "Filter by subcategory id"),
        queryParam("subcategory", { type: "string" }, "Filter by subcategory slug or name"),
        queryParam("minPrice", { type: "number" }, "Minimum selling price"),
        queryParam("maxPrice", { type: "number" }, "Maximum selling price"),
        queryParam("size", { type: "string" }, "Filter by variant size"),
        queryParam("color", { type: "string" }, "Filter by variant color"),
        queryParam("featured", { type: "boolean" }, "Filter featured products"),
        queryParam("bestseller", { type: "boolean" }, "Filter best seller products"),
        queryParam("newArrival", { type: "boolean" }, "Filter new arrival products"),
        queryParam("sort", {
          type: "string",
          enum: [
            "newest",
            "oldest",
            "price_asc",
            "price_desc",
            "name_asc",
            "name_desc",
            "best_selling",
            "top_rated",
            "popular",
            "featured",
          ],
        }),
      ],
      responses: {
        "200": {
          description: "Products fetched successfully",
          content: jsonRef("#/components/schemas/ProductListResponse"),
        },
        "400": {
          description: "Invalid query parameters",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Category or subcategory not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    post: {
      tags: ["Products"],
      operationId: "createProduct",
      summary: "Create a new product",
      security: bearerAuth,
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/CreateProductRequest"),
      },
      responses: {
        "201": {
          description: "Product created successfully",
          content: jsonRef("#/components/schemas/ProductMutationResponse"),
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
  "/api/v1/products/images/upload": {
    post: {
      tags: ["Products"],
      operationId: "uploadProductImages",
      summary: "Upload product images and save them to ProductImage",
      description:
        "Multipart endpoint for admin users. Send `productId` and up to 8 image files using the `images` field. This endpoint uploads to Cloudinary and persists rows in `ProductImage`.",
      security: bearerAuth,
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["productId", "images"],
              properties: {
                productId: {
                  type: "integer",
                  example: 1,
                },
                images: {
                  type: "array",
                  items: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Product images uploaded and saved successfully",
          content: jsonRef("#/components/schemas/SavedProductImagesResponse"),
        },
        "400": {
          description: "Invalid file upload request",
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
          description: "Product not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/products/images/temp-upload": {
    post: {
      tags: ["Products"],
      operationId: "uploadTemporaryProductImages",
      summary: "Upload product images before product creation",
      description:
        "Multipart endpoint for admin users. Uploads images to Cloudinary and returns `imageUrl` and `publicId` so you can send them later in `POST /api/v1/products`.",
      security: bearerAuth,
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["images"],
              properties: {
                images: {
                  type: "array",
                  items: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Product images uploaded successfully",
          content: jsonRef("#/components/schemas/UploadProductImagesResponse"),
        },
        "400": {
          description: "Invalid file upload request",
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
      },
    },
  },
  "/api/v1/products/images": {
    delete: {
      tags: ["Products"],
      operationId: "deleteUploadedProductImages",
      summary: "Delete uploaded product images from Cloudinary",
      security: bearerAuth,
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/DeleteUploadedImagesRequest"),
      },
      responses: {
        "200": {
          description: "Uploaded product images deleted successfully",
          content: jsonRef("#/components/schemas/DeleteResponse"),
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
      },
    },
  },
  "/api/v1/products/{identifier}": {
    get: {
      tags: ["Products"],
      operationId: "getProductDetailsByIdentifier",
      summary: "Get product details by slug or id",
      parameters: [
        pathParam(
          "identifier",
          { type: "string" },
          "Product slug for public pages or numeric product id"
        ),
      ],
      responses: {
        "200": {
          description: "Product details fetched successfully",
          content: jsonRef("#/components/schemas/ProductDetailsResponse"),
        },
        "404": {
          description: "Product not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/products/{id}": {
    put: {
      tags: ["Products"],
      operationId: "updateProductById",
      summary: "Update product by id",
      description: "Admin endpoint. Use the numeric product id.",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Numeric product id")],
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/UpdateProductRequest"),
      },
      responses: {
        "200": {
          description: "Product updated successfully",
          content: jsonRef("#/components/schemas/ProductMutationResponse"),
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
          description: "Product not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "409": {
          description: "Conflict",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    delete: {
      tags: ["Products"],
      operationId: "deleteProductById",
      summary: "Delete product by id",
      description: "Admin endpoint. Soft deletes the product using the numeric product id.",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Numeric product id")],
      responses: {
        "200": {
          description: "Product deleted successfully",
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
          description: "Product not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/products/slug/{slug}": {
    get: {
      tags: ["Products"],
      operationId: "getProductDetailsBySlug",
      summary: "Get product details by slug",
      description: "Alias endpoint for product detail pages that use slugs explicitly.",
      parameters: [pathParam("slug", { type: "string" })],
      responses: {
        "200": {
          description: "Product details fetched successfully",
          content: jsonRef("#/components/schemas/ProductDetailsResponse"),
        },
        "404": {
          description: "Product not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
};
