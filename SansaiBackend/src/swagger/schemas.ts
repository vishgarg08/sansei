const authUserSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 1 },
    name: { type: "string", example: "Priya Panchal" },
    email: { type: "string", example: "priya@gmail.com" },
    phone: { type: "string", nullable: true, example: "9876543210" },
    role: { type: "string", example: "CUSTOMER" },
    provider: { type: "string", example: "LOCAL" },
    googleId: { type: "string", nullable: true, example: "google-user-id" },
    profileImage: {
      type: "string",
      nullable: true,
      example: "https://example.com/profile.jpg",
    },
    isActive: { type: "boolean", example: true },
    isEmailVerified: { type: "boolean", example: false },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    customerProfile: {
      type: "object",
      nullable: true,
      properties: {
        id: { type: "integer", example: 1 },
        referralCode: { type: "string", nullable: true, example: "WELCOME10" },
        totalOrders: { type: "integer", example: 0 },
        totalSpent: { type: "number", example: 0 },
        walletBalance: { type: "number", example: 0 },
      },
    },
  },
};

const tokenSchema = {
  type: "object",
  properties: {
    accessToken: { type: "string", example: "eyJhbGciOi..." },
    refreshToken: { type: "string", example: "eyJhbGciOi..." },
    tokenType: { type: "string", example: "Bearer" },
    accessTokenExpiresIn: { type: "string", example: "15d" },
    refreshTokenExpiresIn: { type: "string", example: "30d" },
  },
};

const categorySummarySchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 1 },
    name: { type: "string", example: "T-Shirts" },
    slug: { type: "string", example: "t-shirts" },
    isActive: { type: "boolean", example: true },
  },
};

const subCategorySummarySchema = {
  type: "object",
  nullable: true,
  properties: {
    id: { type: "integer", example: 3 },
    name: { type: "string", example: "Oversized T-Shirts" },
    slug: { type: "string", example: "oversized-t-shirts" },
    isActive: { type: "boolean", example: true },
  },
};

const bannerSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 1 },
    title: { type: "string", example: "Summer Drop" },
    description: { type: "string", nullable: true, example: "Fresh oversized styles" },
    imageUrl: {
      type: "string",
      example: "https://res.cloudinary.com/demo/image/upload/v1/fashion-store/banners/summer.jpg",
    },
    linkUrl: { type: "string", nullable: true, example: "/collections/summer-drop" },
    isActive: { type: "boolean", example: true },
    displayOrder: { type: "integer", example: 1 },
    startDate: { type: "string", format: "date-time", nullable: true },
    endDate: { type: "string", format: "date-time", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const subCategoryListItemSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 3 },
    categoryId: { type: "integer", example: 1 },
    name: { type: "string", example: "Oversized T-Shirts" },
    slug: { type: "string", example: "oversized-t-shirts" },
    description: {
      type: "string",
      nullable: true,
      example: "Relaxed fit t-shirt collection",
    },
    image: {
      type: "string",
      nullable: true,
      example: "https://cdn.trusttees.com/categories/oversized.jpg",
    },
    isActive: { type: "boolean", example: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    productCount: { type: "integer", example: 12 },
  },
};

const categorySchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 1 },
    name: { type: "string", example: "T-Shirts" },
    slug: { type: "string", example: "t-shirts" },
    description: {
      type: "string",
      nullable: true,
      example: "All t-shirt collections",
    },
    image: {
      type: "string",
      nullable: true,
      example: "https://cdn.trusttees.com/categories/t-shirts.jpg",
    },
    isActive: { type: "boolean", example: true },
    displayOrder: { type: "integer", example: 1 },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    productCount: { type: "integer", example: 40 },
    subCategoryCount: { type: "integer", example: 4 },
    subcategories: {
      type: "array",
      items: { $ref: "#/components/schemas/SubCategoryListItem" },
    },
  },
};

const subCategorySchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 3 },
    categoryId: { type: "integer", example: 1 },
    name: { type: "string", example: "Oversized T-Shirts" },
    slug: { type: "string", example: "oversized-t-shirts" },
    description: {
      type: "string",
      nullable: true,
      example: "Relaxed fit t-shirt collection",
    },
    image: {
      type: "string",
      nullable: true,
      example: "https://cdn.trusttees.com/categories/oversized.jpg",
    },
    isActive: { type: "boolean", example: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    productCount: { type: "integer", example: 12 },
    category: { $ref: "#/components/schemas/CategorySummary" },
  },
};

const productImageSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 10 },
    productId: { type: "integer", example: 1 },
    imageUrl: {
      type: "string",
      example: "https://res.cloudinary.com/demo/image/upload/v1742/fashion-store/products/black-tee-front.jpg",
    },
    publicId: {
      type: "string",
      nullable: true,
      example: "fashion-store/products/black-tee-front_abcd12",
    },
    blurHash: { type: "string", nullable: true, example: "LEHV6nWB2yk8pyo0adR*.7kCMdnj" },
    altText: { type: "string", nullable: true, example: "Front view" },
    isPrimary: { type: "boolean", example: true },
    displayOrder: { type: "integer", example: 0 },
    createdAt: { type: "string", format: "date-time" },
  },
};

const productVariantSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 101 },
    size: { type: "string", example: "M" },
    color: { type: "string", example: "Black" },
    sku: { type: "string", example: "TEE-BLK-M" },
    price: { type: "number", nullable: true, example: 799 },
    stock: { type: "integer", example: 25 },
    reservedStock: { type: "integer", example: 3 },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const stockVariantSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 101 },
    sku: { type: "string", example: "TEE-BLK-M" },
    size: { type: "string", example: "M" },
    color: { type: "string", example: "Black" },
    stock: { type: "integer", example: 25 },
    reservedStock: { type: "integer", example: 3 },
    availableStock: { type: "integer", example: 22 },
    price: { type: "number", nullable: true, example: 799 },
  },
};

const stockSummarySchema = {
  type: "object",
  properties: {
    totalStock: { type: "integer", example: 95 },
    totalReservedStock: { type: "integer", example: 7 },
    availableStock: { type: "integer", example: 88 },
    inStock: { type: "boolean", example: true },
    variants: {
      type: "array",
      items: { $ref: "#/components/schemas/StockVariant" },
    },
  },
};

const reviewSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 1 },
    rating: { type: "integer", example: 5 },
    comment: { type: "string", nullable: true, example: "Very soft and premium quality." },
    images: {
      type: "array",
      items: { type: "string" },
      example: ["https://res.cloudinary.com/demo/image/upload/v1/fashion-store/reviews/review-1.jpg"],
    },
    verified: { type: "boolean", example: true },
    helpful: { type: "integer", example: 14 },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    user: {
      type: "object",
      properties: {
        id: { type: "integer", example: 1 },
        name: { type: "string", example: "Priya Panchal" },
        profileImage: {
          type: "string",
          nullable: true,
          example: "https://cdn.example.com/users/priya.jpg",
        },
      },
    },
  },
};

const productSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 1 },
    categoryId: { type: "integer", example: 1 },
    subCategoryId: { type: "integer", nullable: true, example: 3 },
    name: { type: "string", example: "Black Oversized T-Shirt" },
    slug: { type: "string", example: "black-oversized-t-shirt" },
    shortDescription: {
      type: "string",
      nullable: true,
      example: "Comfort fit premium cotton tee",
    },
    description: {
      type: "string",
      example: "Premium cotton oversized t-shirt with soft hand feel.",
    },
    fabricType: { type: "string", nullable: true, example: "100% Cotton" },
    fitType: { type: "string", nullable: true, example: "Oversized" },
    careInstructions: {
      type: "string",
      nullable: true,
      example: "Machine wash cold",
    },
    brand: { type: "string", nullable: true, example: "Trusttees" },
    sku: { type: "string", example: "TEE-BLK-OS" },
    basePrice: { type: "number", example: 999 },
    discountPrice: { type: "number", nullable: true, example: 799 },
    sellingPrice: { type: "number", example: 799 },
    costPrice: { type: "number", nullable: true, example: 500 },
    weight: { type: "number", nullable: true, example: 0.25 },
    tags: {
      type: "array",
      items: { type: "string" },
      example: ["oversized", "cotton", "black"],
    },
    seoTitle: { type: "string", nullable: true, example: "Black Oversized T-Shirt" },
    seoDescription: {
      type: "string",
      nullable: true,
      example: "Buy black oversized t-shirt online.",
    },
    seoKeywords: {
      type: "string",
      nullable: true,
      example: "black t-shirt, oversized t-shirt",
    },
    canonicalUrl: {
      type: "string",
      nullable: true,
      example: "https://trusttees.com/products/black-oversized-t-shirt",
    },
    totalViews: { type: "integer", example: 120 },
    totalSold: { type: "integer", example: 42 },
    averageRating: { type: "number", example: 4.5 },
    reviewCount: { type: "integer", example: 18 },
    totalStock: { type: "integer", example: 95 },
    totalReservedStock: { type: "integer", example: 7 },
    availableStock: { type: "integer", example: 88 },
    isActive: { type: "boolean", example: true },
    isFeatured: { type: "boolean", example: true },
    isBestSeller: { type: "boolean", example: false },
    isNewArrival: { type: "boolean", example: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    deletedAt: { type: "string", format: "date-time", nullable: true },
    category: { $ref: "#/components/schemas/CategorySummary" },
    subCategory: { $ref: "#/components/schemas/SubCategorySummary" },
    images: {
      type: "array",
      items: { $ref: "#/components/schemas/ProductImage" },
    },
    variants: {
      type: "array",
      items: { $ref: "#/components/schemas/ProductVariant" },
    },
  },
};

const paginationSchema = {
  type: "object",
  properties: {
    page: { type: "integer", example: 1 },
    limit: { type: "integer", example: 20 },
    total: { type: "integer", example: 42 },
    totalPages: { type: "integer", example: 3 },
    hasNextPage: { type: "boolean", example: true },
    hasPreviousPage: { type: "boolean", example: false },
  },
};

const productUploadResultSchema = {
  type: "object",
  properties: {
    imageUrl: {
      type: "string",
      example: "https://res.cloudinary.com/demo/image/upload/v1742/fashion-store/products/black-tee-front.jpg",
    },
    publicId: {
      type: "string",
      example: "fashion-store/products/black-tee-front_abcd12",
    },
    width: { type: "integer", example: 1200 },
    height: { type: "integer", example: 1200 },
    format: { type: "string", example: "webp" },
    bytes: { type: "integer", example: 182340 },
    originalName: { type: "string", example: "black-tee-front.jpg" },
  },
};

const productDetailsDataSchema = {
  type: "object",
  properties: {
    product: { $ref: "#/components/schemas/Product" },
    images: {
      type: "array",
      items: { $ref: "#/components/schemas/ProductImage" },
    },
    variants: {
      type: "array",
      items: { $ref: "#/components/schemas/ProductVariant" },
    },
    stock: { $ref: "#/components/schemas/StockSummary" },
    reviews: {
      type: "array",
      items: { $ref: "#/components/schemas/Review" },
    },
    reviewCount: { type: "integer", example: 18 },
    averageRating: { type: "number", example: 4.5 },
    relatedProducts: {
      type: "array",
      items: { $ref: "#/components/schemas/Product" },
    },
  },
};

export const tags = [
  { name: "Auth", description: "Authentication APIs" },
  { name: "Categories", description: "Category management APIs" },
  { name: "Dropdowns", description: "Admin dropdown data APIs for product form hydration" },
  { name: "Products", description: "Product catalogue and media APIs" },
  { name: "Subcategories", description: "Subcategory management APIs" },
  { name: "Variants", description: "Product variant CRUD and stock management APIs" },
  { name: "Cart", description: "Shopping cart management APIs" },
  { name: "Wishlist", description: "Product wishlist APIs" },
  { name: "Home", description: "Home page storefront aggregation APIs" },
  { name: "Addresses", description: "Customer delivery addresses APIs" },
  { name: "Coupons", description: "Coupon management and validation APIs" },
  { name: "Checkout", description: "Checkout and order placement APIs" },
  { name: "Payments", description: "Razorpay payment verification APIs" },
  { name: "Orders", description: "Customer order management APIs" },
  { name: "Admin Orders", description: "Admin order management APIs" },
  { name: "Admin Inventory", description: "Admin inventory management: logs, low-stock alerts, stock history, and dashboard" },
  { name: "Reviews", description: "Product review APIs — submit, update, delete, and mark helpful" },
  { name: "Admin Reviews", description: "Admin review moderation — list, approve, and delete reviews" },
  { name: "Tickets", description: "Customer support ticket APIs" },
  { name: "Admin Tickets", description: "Admin support ticket management APIs" },
];

export const securitySchemes = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  },
};

export const schemas = {
  RegisterRequest: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string", example: "Priya Panchal" },
      email: { type: "string", example: "priya@gmail.com" },
      password: { type: "string", example: "Trusttees@1234" },
      phone: { type: "string", example: "9876543210" },
    },
  },
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", example: "priya@gmail.com" },
      password: { type: "string", example: "Trusttees@1234" },
    },
  },
  GoogleLoginRequest: {
    type: "object",
    required: ["token"],
    properties: {
      token: { type: "string", example: "google-id-token" },
    },
  },
  RefreshTokenRequest: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: { type: "string", example: "refresh-token-jwt" },
    },
  },
  LogoutRequest: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: { type: "string", example: "refresh-token-jwt" },
    },
  },
  CreateCategoryRequest: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", example: "T-Shirts" },
      slug: { type: "string", example: "t-shirts" },
      description: { type: "string", example: "All t-shirt collections" },
      image: {
        type: "string",
        example: "https://cdn.trusttees.com/categories/t-shirts.jpg",
      },
      isActive: { type: "boolean", example: true },
      displayOrder: { type: "integer", example: 1 },
    },
  },
  UpdateCategoryRequest: {
    type: "object",
    properties: {
      name: { type: "string", example: "Premium T-Shirts" },
      slug: { type: "string", example: "premium-t-shirts" },
      description: {
        type: "string",
        nullable: true,
        example: "Updated category description",
      },
      image: {
        type: "string",
        nullable: true,
        example: "https://cdn.trusttees.com/categories/premium-t-shirts.jpg",
      },
      isActive: { type: "boolean", example: true },
      displayOrder: { type: "integer", example: 2 },
    },
  },
  CreateSubCategoryRequest: {
    type: "object",
    required: ["categoryId", "name"],
    properties: {
      categoryId: { type: "integer", example: 1 },
      name: { type: "string", example: "Oversized T-Shirts" },
      slug: { type: "string", example: "oversized-t-shirts" },
      description: {
        type: "string",
        example: "Relaxed fit t-shirt collection",
      },
      image: {
        type: "string",
        example: "https://cdn.trusttees.com/categories/oversized.jpg",
      },
      isActive: { type: "boolean", example: true },
    },
  },
  UpdateSubCategoryRequest: {
    type: "object",
    properties: {
      categoryId: { type: "integer", example: 1 },
      name: { type: "string", example: "Heavyweight Oversized T-Shirts" },
      slug: { type: "string", example: "heavyweight-oversized-t-shirts" },
      description: {
        type: "string",
        nullable: true,
        example: "Updated subcategory description",
      },
      image: {
        type: "string",
        nullable: true,
        example: "https://cdn.trusttees.com/categories/heavyweight-oversized.jpg",
      },
      isActive: { type: "boolean", example: true },
    },
  },
  ProductImageInput: {
    type: "object",
    required: ["imageUrl"],
    properties: {
      id: { type: "integer", example: 10 },
      imageUrl: {
        type: "string",
        example: "https://res.cloudinary.com/demo/image/upload/v1742/fashion-store/products/black-tee-front.jpg",
      },
      publicId: {
        type: "string",
        nullable: true,
        example: "fashion-store/products/black-tee-front_abcd12",
      },
      blurHash: { type: "string", nullable: true, example: "LEHV6nWB2yk8pyo0adR*.7kCMdnj" },
      altText: { type: "string", example: "Front view" },
      isPrimary: { type: "boolean", example: true },
      displayOrder: { type: "integer", example: 0 },
    },
  },
  ProductVariantInput: {
    type: "object",
    required: ["size", "color", "sku"],
    properties: {
      id: { type: "integer", example: 101 },
      size: { type: "string", example: "M" },
      color: { type: "string", example: "Black" },
      sku: { type: "string", example: "TEE-BLK-M" },
      price: { type: "number", nullable: true, example: 799 },
      stock: { type: "integer", example: 25 },
      reservedStock: { type: "integer", example: 3 },
    },
  },
  CreateProductRequest: {
    type: "object",
    required: ["categoryId", "name", "description", "sku", "basePrice"],
    properties: {
      categoryId: { type: "integer", example: 1 },
      subCategoryId: { type: "integer", nullable: true, example: 3 },
      name: { type: "string", example: "Black Oversized T-Shirt" },
      slug: { type: "string", example: "black-oversized-t-shirt" },
      shortDescription: {
        type: "string",
        example: "Comfort fit premium cotton tee",
      },
      description: {
        type: "string",
        example: "Premium cotton oversized t-shirt with soft hand feel.",
      },
      fabricType: { type: "string", example: "100% Cotton" },
      fitType: { type: "string", example: "Oversized" },
      careInstructions: { type: "string", example: "Machine wash cold" },
      brand: { type: "string", example: "Trusttees" },
      sku: { type: "string", example: "TEE-BLK-OS" },
      basePrice: { type: "number", example: 999 },
      discountPrice: { type: "number", nullable: true, example: 799 },
      costPrice: { type: "number", nullable: true, example: 500 },
      weight: { type: "number", nullable: true, example: 0.25 },
      tags: {
        type: "array",
        items: { type: "string" },
        example: ["oversized", "cotton", "black"],
      },
      seoTitle: { type: "string", example: "Black Oversized T-Shirt" },
      seoDescription: {
        type: "string",
        example: "Buy black oversized t-shirt online.",
      },
      seoKeywords: {
        type: "string",
        example: "black t-shirt, oversized t-shirt",
      },
      canonicalUrl: {
        type: "string",
        example: "https://trusttees.com/products/black-oversized-t-shirt",
      },
      isActive: { type: "boolean", example: true },
      isFeatured: { type: "boolean", example: true },
      isBestSeller: { type: "boolean", example: false },
      isNewArrival: { type: "boolean", example: true },
      images: {
        type: "array",
        items: { $ref: "#/components/schemas/ProductImageInput" },
      },
      variants: {
        type: "array",
        items: { $ref: "#/components/schemas/ProductVariantInput" },
      },
    },
  },
  UpdateProductRequest: {
    type: "object",
    properties: {
      categoryId: { type: "integer", example: 1 },
      subCategoryId: { type: "integer", nullable: true, example: 3 },
      name: { type: "string", example: "Black Oversized T-Shirt Updated" },
      slug: { type: "string", example: "black-oversized-t-shirt-updated" },
      shortDescription: {
        type: "string",
        nullable: true,
        example: "Updated short description",
      },
      description: {
        type: "string",
        example: "Updated premium cotton oversized t-shirt.",
      },
      fabricType: { type: "string", nullable: true, example: "French Terry" },
      fitType: { type: "string", nullable: true, example: "Regular" },
      careInstructions: { type: "string", nullable: true, example: "Hand wash" },
      brand: { type: "string", nullable: true, example: "Trusttees" },
      sku: { type: "string", example: "TEE-BLK-OS-NEW" },
      basePrice: { type: "number", example: 1099 },
      discountPrice: { type: "number", nullable: true, example: 899 },
      costPrice: { type: "number", nullable: true, example: 540 },
      weight: { type: "number", nullable: true, example: 0.27 },
      tags: {
        type: "array",
        nullable: true,
        items: { type: "string" },
        example: ["updated", "premium"],
      },
      seoTitle: { type: "string", nullable: true, example: "Updated T-Shirt" },
      seoDescription: {
        type: "string",
        nullable: true,
        example: "Updated SEO description",
      },
      seoKeywords: {
        type: "string",
        nullable: true,
        example: "updated t-shirt",
      },
      canonicalUrl: {
        type: "string",
        nullable: true,
        example: "https://trusttees.com/products/updated-product",
      },
      isActive: { type: "boolean", example: true },
      isFeatured: { type: "boolean", example: false },
      isBestSeller: { type: "boolean", example: true },
      isNewArrival: { type: "boolean", example: false },
      images: {
        type: "array",
        items: { $ref: "#/components/schemas/ProductImageInput" },
      },
      removeImageIds: {
        type: "array",
        items: { type: "integer" },
        example: [10],
      },
      variants: {
        type: "array",
        items: { $ref: "#/components/schemas/ProductVariantInput" },
      },
      removeVariantIds: {
        type: "array",
        items: { type: "integer" },
        example: [101],
      },
    },
  },
  DeleteUploadedImagesRequest: {
    type: "object",
    required: ["publicIds"],
    properties: {
      publicIds: {
        type: "array",
        items: { type: "string" },
        example: ["fashion-store/products/black-tee-front_abcd12"],
      },
    },
  },
  AuthUser: authUserSchema,
  AuthTokens: tokenSchema,
  CategorySummary: categorySummarySchema,
  SubCategorySummary: subCategorySummarySchema,
  Banner: bannerSchema,
  SubCategoryListItem: subCategoryListItemSchema,
  Category: categorySchema,
  SubCategory: subCategorySchema,
  ProductImage: productImageSchema,
  ProductVariant: productVariantSchema,
  StockVariant: stockVariantSchema,
  StockSummary: stockSummarySchema,
  Review: reviewSchema,
  Product: productSchema,
  Pagination: paginationSchema,
  ProductUploadResult: productUploadResultSchema,
  ProductDetailsData: productDetailsDataSchema,
  AuthSuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Login successful" },
      data: {
        type: "object",
        properties: {
          user: authUserSchema,
          tokens: tokenSchema,
        },
      },
    },
  },
  MeResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: authUserSchema,
    },
  },
  CategoryResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { $ref: "#/components/schemas/Category" },
    },
  },
  CategoryMutationResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Category created successfully" },
      data: { $ref: "#/components/schemas/Category" },
    },
  },
  CategoryListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Category" },
      },
    },
  },
  SubCategoryResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { $ref: "#/components/schemas/SubCategory" },
    },
  },
  SubCategoryMutationResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Subcategory created successfully" },
      data: { $ref: "#/components/schemas/SubCategory" },
    },
  },
  SubCategoryListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/SubCategory" },
      },
    },
  },
  ProductResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { $ref: "#/components/schemas/Product" },
    },
  },
  ProductMutationResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Product created successfully" },
      data: { $ref: "#/components/schemas/Product" },
    },
  },
  ProductListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Product" },
      },
      pagination: { $ref: "#/components/schemas/Pagination" },
    },
  },
  ProductDetailsResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { $ref: "#/components/schemas/ProductDetailsData" },
    },
  },
  UploadProductImagesResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Product images uploaded successfully" },
      data: {
        type: "array",
        items: {
          oneOf: [
            { $ref: "#/components/schemas/ProductImage" },
            { $ref: "#/components/schemas/ProductUploadResult" },
          ],
        },
      },
    },
  },
  SavedProductImagesResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Product images uploaded and saved successfully" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/ProductImage" },
      },
    },
  },
  HomeResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          banners: {
            type: "array",
            items: { $ref: "#/components/schemas/Banner" },
          },
          featuredProducts: {
            type: "array",
            items: { $ref: "#/components/schemas/Product" },
          },
          bestSellers: {
            type: "array",
            items: { $ref: "#/components/schemas/Product" },
          },
          newArrivals: {
            type: "array",
            items: { $ref: "#/components/schemas/Product" },
          },
          trendingProducts: {
            type: "array",
            items: { $ref: "#/components/schemas/Product" },
          },
          categories: {
            type: "array",
            items: { $ref: "#/components/schemas/Category" },
          },
        },
      },
    },
  },
  DeleteResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Operation completed successfully" },
    },
  },
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Validation failed" },
      details: {
        type: "object",
        nullable: true,
      },
      errors: {
        type: "array",
        items: { type: "string" },
        example: ['"email" is required'],
      },
    },
  },

  // ─── Dropdown Schemas ────────────────────────────────────────────────────

  CategoryDropdownItem: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      name: { type: "string", example: "T-Shirts" },
      slug: { type: "string", example: "t-shirts" },
    },
  },
  SubCategoryDropdownItem: {
    type: "object",
    properties: {
      id: { type: "integer", example: 3 },
      name: { type: "string", example: "Oversized T-Shirts" },
      slug: { type: "string", example: "oversized-t-shirts" },
      categoryId: { type: "integer", example: 1 },
    },
  },
  DistinctValueItem: {
    type: "object",
    properties: {
      value: { type: "string", example: "M" },
      count: { type: "integer", example: 15 },
    },
  },
  CategoriesDropdownResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/CategoryDropdownItem" },
      },
    },
  },
  SubCategoriesDropdownResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/SubCategoryDropdownItem" },
      },
    },
  },
  DistinctValuesResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/DistinctValueItem" },
      },
    },
  },
  SizesColorsResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          sizes: {
            type: "array",
            items: { $ref: "#/components/schemas/DistinctValueItem" },
          },
          colors: {
            type: "array",
            items: { $ref: "#/components/schemas/DistinctValueItem" },
          },
        },
      },
    },
  },
  ProductFormDataResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          categories: {
            type: "array",
            items: { $ref: "#/components/schemas/CategoryDropdownItem" },
          },
          subcategories: {
            type: "array",
            items: { $ref: "#/components/schemas/SubCategoryDropdownItem" },
          },
          sizes: {
            type: "array",
            items: { $ref: "#/components/schemas/DistinctValueItem" },
          },
          colors: {
            type: "array",
            items: { $ref: "#/components/schemas/DistinctValueItem" },
          },
        },
      },
    },
  },

  // ─── Variant Schemas ─────────────────────────────────────────────────────

  VariantDetail: {
    type: "object",
    properties: {
      id: { type: "integer", example: 101 },
      productId: { type: "integer", example: 1 },
      size: { type: "string", example: "M" },
      color: { type: "string", example: "Black" },
      sku: { type: "string", example: "TEE-BLK-M" },
      price: { type: "number", nullable: true, example: 799 },
      stock: { type: "integer", example: 25 },
      reservedStock: { type: "integer", example: 3 },
      availableStock: { type: "integer", example: 22 },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  CreateVariantItem: {
    type: "object",
    required: ["size", "color", "sku"],
    properties: {
      size: { type: "string", example: "M" },
      color: { type: "string", example: "Black" },
      sku: { type: "string", example: "TEE-BLK-M" },
      price: { type: "number", nullable: true, example: 799 },
      stock: { type: "integer", example: 25 },
    },
  },
  CreateVariantsRequest: {
    type: "object",
    required: ["variants"],
    properties: {
      variants: {
        type: "array",
        items: { $ref: "#/components/schemas/CreateVariantItem" },
        minItems: 1,
        maxItems: 100,
      },
    },
  },
  UpdateVariantRequest: {
    type: "object",
    properties: {
      size: { type: "string", example: "L" },
      color: { type: "string", example: "Navy Blue" },
      sku: { type: "string", example: "TEE-NVY-L" },
      price: { type: "number", nullable: true, example: 899 },
      stock: { type: "integer", example: 30 },
    },
  },
  UpdateStockRequest: {
    type: "object",
    required: ["action", "quantity"],
    properties: {
      action: {
        type: "string",
        enum: ["IN", "OUT", "RETURN", "CANCELLED", "MANUAL"],
        example: "IN",
      },
      quantity: { type: "integer", minimum: 1, example: 10 },
      reference: { type: "string", example: "PO-2024-001" },
      notes: { type: "string", example: "Restocked from warehouse" },
    },
  },
  BulkStockItem: {
    type: "object",
    required: ["variantId", "action", "quantity"],
    properties: {
      variantId: { type: "integer", example: 101 },
      action: {
        type: "string",
        enum: ["IN", "OUT", "RETURN", "CANCELLED", "MANUAL"],
        example: "IN",
      },
      quantity: { type: "integer", minimum: 1, example: 10 },
      reference: { type: "string", example: "PO-2024-001" },
      notes: { type: "string", example: "Bulk restock" },
    },
  },
  BulkStockUpdateRequest: {
    type: "object",
    required: ["items"],
    properties: {
      items: {
        type: "array",
        items: { $ref: "#/components/schemas/BulkStockItem" },
        minItems: 1,
        maxItems: 100,
      },
    },
  },
  VariantListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/VariantDetail" },
      },
    },
  },
  SingleVariantResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { $ref: "#/components/schemas/VariantDetail" },
    },
  },
  VariantMutationResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Variants created successfully" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/VariantDetail" },
      },
    },
  },
  SingleVariantMutationResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Variant updated successfully" },
      data: { $ref: "#/components/schemas/VariantDetail" },
    },
  },
  ProductStockSummaryResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          productId: { type: "integer", example: 1 },
          totalStock: { type: "integer", example: 95 },
          totalReservedStock: { type: "integer", example: 7 },
          totalAvailableStock: { type: "integer", example: 88 },
          inStock: { type: "boolean", example: true },
          variants: {
            type: "array",
            items: { $ref: "#/components/schemas/StockVariant" },
          },
        },
      },
    },
  },

  // ─── Cart Schemas ──────────────────────────────────────────────────────────

  CartItem: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      productId: { type: "integer", example: 1 },
      variantId: { type: "integer", example: 101 },
      quantity: { type: "integer", example: 2 },
      productName: { type: "string", example: "Black Oversized T-Shirt" },
      slug: { type: "string", example: "black-oversized-t-shirt" },
      image: {
        type: "string",
        nullable: true,
        example: "https://res.cloudinary.com/demo/image/upload/v1/fashion-store/products/black-tee.jpg",
      },
      price: { type: "number", example: 999 },
      discountPrice: { type: "number", nullable: true, example: 799 },
      sellingPrice: { type: "number", example: 799 },
      size: { type: "string", example: "M" },
      color: { type: "string", example: "Black" },
      sku: { type: "string", example: "TEE-BLK-M" },
      stock: { type: "integer", example: 22 },
      itemTotal: { type: "number", example: 1598 },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  AddToCartRequest: {
    type: "object",
    required: ["productId", "variantId", "quantity"],
    properties: {
      productId: { type: "integer", example: 1 },
      variantId: { type: "integer", example: 101 },
      quantity: { type: "integer", minimum: 1, maximum: 10, example: 1 },
    },
  },
  UpdateCartItemRequest: {
    type: "object",
    required: ["quantity"],
    properties: {
      quantity: { type: "integer", minimum: 1, maximum: 10, example: 2 },
    },
  },
  CartResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/CartItem" },
          },
          totalItems: { type: "integer", example: 3 },
          cartTotal: { type: "number", example: 2397 },
        },
      },
    },
  },
  CartItemMutationResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Item added to cart" },
      data: { $ref: "#/components/schemas/CartItem" },
    },
  },

  // ─── Wishlist Schemas ──────────────────────────────────────────────────────

  WishlistItem: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      productId: { type: "integer", example: 1 },
      productName: { type: "string", example: "Black Oversized T-Shirt" },
      slug: { type: "string", example: "black-oversized-t-shirt" },
      image: {
        type: "string",
        nullable: true,
        example: "https://res.cloudinary.com/demo/image/upload/v1/fashion-store/products/black-tee.jpg",
      },
      price: { type: "number", example: 999 },
      discountPrice: { type: "number", nullable: true, example: 799 },
      sellingPrice: { type: "number", example: 799 },
      averageRating: { type: "number", example: 4.5 },
      isActive: { type: "boolean", example: true },
      inStock: { type: "boolean", example: true },
      isFeatured: { type: "boolean", example: true },
      isBestSeller: { type: "boolean", example: false },
      isNewArrival: { type: "boolean", example: true },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  WishlistListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/WishlistItem" },
      },
    },
  },
  WishlistToggleResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Product added to wishlist" },
      data: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["added", "removed"], example: "added" },
          productId: { type: "integer", example: 1 },
          item: {
            $ref: "#/components/schemas/WishlistItem",
            nullable: true,
            description: "Present only when action is 'added'",
          },
        },
      },
    },
  },

  // ─── Address Schemas ───────────────────────────────────────────────────────

  Address: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      userId: { type: "integer", example: 1 },
      fullName: { type: "string", example: "Priya Panchal" },
      phone: { type: "string", example: "9876543210" },
      addressLine1: { type: "string", example: "123, Main Street" },
      addressLine2: { type: "string", nullable: true, example: "Apartment 4B" },
      city: { type: "string", example: "Mumbai" },
      state: { type: "string", example: "Maharashtra" },
      postalCode: { type: "string", example: "400001" },
      country: { type: "string", example: "IN" },
      isDefault: { type: "boolean", example: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  CreateAddressRequest: {
    type: "object",
    required: ["fullName", "phone", "addressLine1", "city", "state", "postalCode"],
    properties: {
      fullName: { type: "string", example: "Priya Panchal" },
      phone: { type: "string", example: "9876543210" },
      addressLine1: { type: "string", example: "123, Main Street" },
      addressLine2: { type: "string", example: "Apartment 4B" },
      city: { type: "string", example: "Mumbai" },
      state: { type: "string", example: "Maharashtra" },
      postalCode: { type: "string", example: "400001" },
      country: { type: "string", example: "IN", default: "IN" },
      isDefault: { type: "boolean", example: false, default: false },
    },
  },
  UpdateAddressRequest: {
    type: "object",
    properties: {
      fullName: { type: "string", example: "Priya Panchal" },
      phone: { type: "string", example: "9876543210" },
      addressLine1: { type: "string", example: "123, Main Street" },
      addressLine2: { type: "string", example: "Apartment 4B" },
      city: { type: "string", example: "Mumbai" },
      state: { type: "string", example: "Maharashtra" },
      postalCode: { type: "string", example: "400001" },
      country: { type: "string", example: "IN" },
      isDefault: { type: "boolean", example: true },
    },
  },
  AddressResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { $ref: "#/components/schemas/Address" },
    },
  },
  AddressListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Address" },
      },
    },
  },
  AddressMutationResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Address created successfully" },
      data: { $ref: "#/components/schemas/Address" },
    },
  },

  // ─── Coupon Schemas ────────────────────────────────────────────────────────

  Coupon: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      code: { type: "string", example: "WINTER30" },
      description: { type: "string", nullable: true, example: "30% off on winter collection" },
      couponType: { type: "string", enum: ["PERCENTAGE", "FIXED"], example: "PERCENTAGE" },
      discountValue: { type: "number", example: 30 },
      maxDiscount: { type: "number", nullable: true, example: 500 },
      minOrderAmount: { type: "number", nullable: true, example: 1000 },
      maxUsagePerUser: { type: "integer", example: 1 },
      maxTotalUsage: { type: "integer", nullable: true, example: 100 },
      totalUsed: { type: "integer", example: 12 },
      isActive: { type: "boolean", example: true },
      expiresAt: { type: "string", format: "date-time" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  CreateCouponRequest: {
    type: "object",
    required: ["code", "couponType", "discountValue", "expiresAt"],
    properties: {
      code: { type: "string", example: "WINTER30" },
      description: { type: "string", example: "30% off on winter collection" },
      couponType: { type: "string", enum: ["PERCENTAGE", "FIXED"], example: "PERCENTAGE" },
      discountValue: { type: "number", example: 30 },
      maxDiscount: { type: "number", example: 500 },
      minOrderAmount: { type: "number", example: 1000 },
      maxUsagePerUser: { type: "integer", example: 1, default: 1 },
      maxTotalUsage: { type: "integer", example: 100 },
      isActive: { type: "boolean", example: true, default: true },
      expiresAt: { type: "string", format: "date-time", example: "2026-12-31T23:59:59.000Z" },
    },
  },
  UpdateCouponRequest: {
    type: "object",
    properties: {
      code: { type: "string", example: "WINTER30" },
      description: { type: "string", example: "30% off on winter collection" },
      couponType: { type: "string", enum: ["PERCENTAGE", "FIXED"], example: "PERCENTAGE" },
      discountValue: { type: "number", example: 30 },
      maxDiscount: { type: "number", example: 500 },
      minOrderAmount: { type: "number", example: 1000 },
      maxUsagePerUser: { type: "integer", example: 1 },
      maxTotalUsage: { type: "integer", example: 100 },
      isActive: { type: "boolean", example: true },
      expiresAt: { type: "string", format: "date-time" },
    },
  },
  ApplyCouponRequest: {
    type: "object",
    required: ["code"],
    properties: {
      code: { type: "string", example: "WINTER30" },
      orderAmount: { type: "number", example: 2500 },
    },
  },
  ApplyCouponResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Coupon applied successfully" },
      data: {
        type: "object",
        properties: {
          discount: { type: "number", example: 500 },
          finalAmount: { type: "number", example: 2000 },
        },
      },
    },
  },
  CouponResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { $ref: "#/components/schemas/Coupon" },
    },
  },
  CouponListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Coupon" },
      },
    },
  },
  CouponMutationResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Coupon created successfully" },
      data: { $ref: "#/components/schemas/Coupon" },
    },
  },

  // ═══════════════ CHECKOUT ═══════════════

  CheckoutRequest: {
    type: "object",
    required: ["addressId", "paymentMethod"],
    properties: {
      addressId: { type: "integer", example: 1 },
      couponCode: { type: "string", example: "WINTER30" },
      paymentMethod: { type: "string", enum: ["RAZORPAY", "COD"], example: "RAZORPAY" },
      customerNotes: { type: "string", example: "Please deliver before 5 PM" },
    },
  },
  CheckoutResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Order placed successfully" },
      data: {
        type: "object",
        properties: {
          order: {
            type: "object",
            properties: {
              id: { type: "integer", example: 1 },
              orderNumber: { type: "string", example: "TT-M1A2B3-C4D5E6" },
              status: { type: "string", example: "PENDING" },
              paymentStatus: { type: "string", example: "PENDING" },
              paymentMethod: { type: "string", example: "RAZORPAY" },
              subtotal: { type: "number", example: 1598 },
              discountAmount: { type: "number", example: 200 },
              taxAmount: { type: "number", example: 251.64 },
              shippingCharges: { type: "number", example: 0 },
              totalAmount: { type: "number", example: 1649.64 },
              couponCode: { type: "string", nullable: true, example: "WINTER30" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
          payment: {
            type: "object",
            nullable: true,
            properties: {
              razorpayOrderId: { type: "string", example: "order_ABC123" },
              razorpayKeyId: { type: "string", example: "rzp_test_xxxx" },
              amount: { type: "integer", example: 164964 },
              currency: { type: "string", example: "INR" },
            },
          },
        },
      },
    },
  },

  // ═══════════════ PAYMENT ═══════════════

  PaymentVerifyRequest: {
    type: "object",
    required: ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature"],
    properties: {
      razorpay_order_id: { type: "string", example: "order_ABC123" },
      razorpay_payment_id: { type: "string", example: "pay_XYZ789" },
      razorpay_signature: { type: "string", example: "signature_hash" },
    },
  },
  PaymentVerifyResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Payment verified successfully" },
      data: {
        type: "object",
        properties: {
          orderId: { type: "integer", example: 1 },
          orderNumber: { type: "string", example: "TT-M1A2B3-C4D5E6" },
          status: { type: "string", example: "CONFIRMED" },
          paymentStatus: { type: "string", example: "SUCCESS" },
          totalAmount: { type: "number", example: 1649.64 },
        },
      },
    },
  },
  PaymentFailureRequest: {
    type: "object",
    required: ["razorpay_order_id"],
    properties: {
      razorpay_order_id: { type: "string", example: "order_ABC123" },
      errorCode: { type: "string", example: "BAD_REQUEST_ERROR" },
      errorDescription: { type: "string", example: "Payment processing failed" },
    },
  },
  PaymentFailureResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Payment failed and order has been cancelled." },
      data: {
        type: "object",
        properties: {
          orderId: { type: "integer", example: 1 },
          orderNumber: { type: "string", example: "TT-M1A2B3-C4D5E6" },
          status: { type: "string", example: "CANCELLED" },
          paymentStatus: { type: "string", example: "FAILED" },
        },
      },
    },
  },

  // ═══════════════ ORDER ═══════════════

  OrderItem: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      productId: { type: "integer", example: 1 },
      variantId: { type: "integer", example: 101 },
      quantity: { type: "integer", example: 2 },
      unitPrice: { type: "number", example: 799 },
      totalPrice: { type: "number", example: 1598 },
      size: { type: "string", example: "M" },
      color: { type: "string", example: "Black" },
      productName: { type: "string", example: "Black Oversized T-Shirt" },
      productSlug: { type: "string", example: "black-oversized-t-shirt" },
      productImage: { type: "string", nullable: true, example: "https://cdn.example.com/product.jpg" },
    },
  },
  OrderTimeline: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      status: { type: "string", example: "CONFIRMED" },
      notes: { type: "string", nullable: true, example: "Payment confirmed via Razorpay" },
      changedByAdminId: { type: "integer", nullable: true, example: null },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  OrderSummary: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      orderNumber: { type: "string", example: "TT-M1A2B3-C4D5E6" },
      status: { type: "string", example: "CONFIRMED" },
      paymentStatus: { type: "string", example: "SUCCESS" },
      paymentMethod: { type: "string", example: "RAZORPAY" },
      subtotal: { type: "number", example: 1598 },
      discountAmount: { type: "number", example: 200 },
      taxAmount: { type: "number", example: 251.64 },
      shippingCharges: { type: "number", example: 0 },
      totalAmount: { type: "number", example: 1649.64 },
      couponCode: { type: "string", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
    },
  },
  OrderListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { type: "array", items: { $ref: "#/components/schemas/OrderSummary" } },
      pagination: { $ref: "#/components/schemas/Pagination" },
    },
  },
  OrderDetailResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        allOf: [
          { $ref: "#/components/schemas/OrderSummary" },
          {
            type: "object",
            properties: {
              shippingTrackingId: { type: "string", nullable: true },
              estimatedDelivery: { type: "string", format: "date-time", nullable: true },
              deliveredAt: { type: "string", format: "date-time", nullable: true },
              customerNotes: { type: "string", nullable: true },
              address: { $ref: "#/components/schemas/Address" },
              payment: { $ref: "#/components/schemas/PaymentRecord" },
              timelines: { type: "array", items: { $ref: "#/components/schemas/OrderTimeline" } },
            },
          },
        ],
      },
    },
  },
  CancelOrderRequest: {
    type: "object",
    required: ["reason"],
    properties: {
      reason: { type: "string", example: "Changed my mind about the purchase" },
    },
  },
  CancelOrderResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Order cancelled successfully" },
      data: {
        type: "object",
        properties: {
          orderId: { type: "integer", example: 1 },
          orderNumber: { type: "string", example: "TT-M1A2B3-C4D5E6" },
          status: { type: "string", example: "CANCELLED" },
        },
      },
    },
  },
  PaymentRecord: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      paymentMethod: { type: "string", example: "RAZORPAY" },
      transactionId: { type: "string", nullable: true, example: "pay_XYZ789" },
      amount: { type: "number", example: 1649.64 },
      status: { type: "string", example: "SUCCESS" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  // ═══════════════ ADMIN ORDER ═══════════════

  AdminOrderSummary: {
    allOf: [
      { $ref: "#/components/schemas/OrderSummary" },
      {
        type: "object",
        properties: {
          userId: { type: "integer", example: 1 },
          shippingTrackingId: { type: "string", nullable: true },
          customer: {
            type: "object",
            properties: {
              id: { type: "integer", example: 1 },
              name: { type: "string", example: "Priya Panchal" },
              email: { type: "string", example: "priya@gmail.com" },
              phone: { type: "string", nullable: true, example: "9876543210" },
            },
          },
        },
      },
    ],
  },
  AdminOrderListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { type: "array", items: { $ref: "#/components/schemas/AdminOrderSummary" } },
      pagination: { $ref: "#/components/schemas/Pagination" },
    },
  },
  AdminOrderDetailResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Order status updated to SHIPPED" },
      data: {
        allOf: [
          { $ref: "#/components/schemas/AdminOrderSummary" },
          {
            type: "object",
            properties: {
              estimatedDelivery: { type: "string", format: "date-time", nullable: true },
              deliveredAt: { type: "string", format: "date-time", nullable: true },
              customerNotes: { type: "string", nullable: true },
              internalNotes: { type: "string", nullable: true },
              address: { $ref: "#/components/schemas/Address" },
              payment: { $ref: "#/components/schemas/PaymentRecord" },
              timelines: { type: "array", items: { $ref: "#/components/schemas/OrderTimeline" } },
            },
          },
        ],
      },
    },
  },
  AdminUpdateStatusRequest: {
    type: "object",
    required: ["status"],
    properties: {
      status: {
        type: "string",
        enum: [
          "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY",
          "DELIVERED", "CANCELLED", "RETURN_REQUESTED", "RETURNED",
        ],
        example: "SHIPPED",
      },
      notes: { type: "string", example: "Shipped via Blue Dart" },
      shippingTrackingId: { type: "string", example: "BD123456789" },
    },
  },

  // ─── Inventory Schemas ────────────────────────────────────────────────────

  InventoryLog: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      productId: { type: "integer", example: 1 },
      productName: { type: "string", nullable: true, example: "Black Oversized T-Shirt" },
      productSku: { type: "string", nullable: true, example: "TEE-BLK-OS" },
      variantId: { type: "integer", example: 101 },
      variantSku: { type: "string", nullable: true, example: "TEE-BLK-M" },
      variantSize: { type: "string", nullable: true, example: "M" },
      variantColor: { type: "string", nullable: true, example: "Black" },
      action: {
        type: "string",
        enum: ["IN", "OUT", "RETURN", "CANCELLED", "MANUAL"],
        example: "OUT",
      },
      quantityChanged: { type: "integer", example: 2 },
      previousStock: { type: "integer", example: 25 },
      newStock: { type: "integer", example: 23 },
      reference: {
        type: "string",
        nullable: true,
        example: "ORDER:TT-ABC123-XYZ",
      },
      notes: {
        type: "string",
        nullable: true,
        example: "Stock reduced after payment confirmation for order TT-ABC123-XYZ",
      },
      createdAt: { type: "string", format: "date-time" },
    },
  },

  InventoryLogListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/InventoryLog" },
      },
      pagination: { $ref: "#/components/schemas/Pagination" },
    },
  },

  LowStockVariant: {
    type: "object",
    properties: {
      id: { type: "integer", example: 101 },
      productId: { type: "integer", example: 1 },
      productName: { type: "string", example: "Black Oversized T-Shirt" },
      productSku: { type: "string", example: "TEE-BLK-OS" },
      productSlug: { type: "string", example: "black-oversized-t-shirt" },
      sku: { type: "string", example: "TEE-BLK-M" },
      size: { type: "string", example: "M" },
      color: { type: "string", example: "Black" },
      stock: { type: "integer", example: 3 },
      reservedStock: { type: "integer", example: 1 },
      availableStock: { type: "integer", example: 2 },
    },
  },

  LowStockResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          threshold: { type: "integer", example: 10 },
          total: { type: "integer", example: 4 },
          variants: {
            type: "array",
            items: { $ref: "#/components/schemas/LowStockVariant" },
          },
        },
      },
    },
  },

  InventoryDashboardSummary: {
    type: "object",
    properties: {
      totalVariants: { type: "integer", example: 48 },
      totalStock: { type: "integer", example: 1240 },
      totalReserved: { type: "integer", example: 32 },
      totalAvailable: { type: "integer", example: 1208 },
      outOfStockVariants: { type: "integer", example: 2 },
      lowStockVariants: { type: "integer", example: 5 },
      lowStockThreshold: { type: "integer", example: 10 },
    },
  },

  InventoryActivityByAction: {
    type: "object",
    description: "7-day inventory activity keyed by action type",
    additionalProperties: {
      type: "object",
      properties: {
        count: { type: "integer", example: 12 },
        totalQty: { type: "integer", example: 48 },
      },
    },
    example: {
      OUT: { count: 12, totalQty: 48 },
      RETURN: { count: 2, totalQty: 4 },
      CANCELLED: { count: 1, totalQty: 3 },
      IN: { count: 3, totalQty: 120 },
    },
  },

  InventoryDashboardResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          summary: { $ref: "#/components/schemas/InventoryDashboardSummary" },
          recentActivity: {
            type: "object",
            properties: {
              periodDays: { type: "integer", example: 7 },
              byAction: { $ref: "#/components/schemas/InventoryActivityByAction" },
            },
          },
        },
      },
    },
  },

  VariantStockState: {
    type: "object",
    properties: {
      id: { type: "integer", example: 101 },
      sku: { type: "string", example: "TEE-BLK-M" },
      size: { type: "string", example: "M" },
      color: { type: "string", example: "Black" },
      stock: { type: "integer", example: 23 },
      reservedStock: { type: "integer", example: 1 },
      availableStock: { type: "integer", example: 22 },
    },
  },

  VariantInventoryLogsResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          variant: { $ref: "#/components/schemas/VariantStockState" },
          logs: {
            type: "array",
            items: { $ref: "#/components/schemas/InventoryLog" },
          },
          pagination: { $ref: "#/components/schemas/Pagination" },
        },
      },
    },
  },

  // ─── Review Schemas ─────────────────────────────────────────────────

  ReviewUser: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      name: { type: "string", example: "Priya Panchal" },
      profileImage: { type: "string", nullable: true, example: "https://cdn.trusttees.com/users/priya.jpg" },
    },
  },

  ReviewProduct: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      name: { type: "string", example: "Black Oversized T-Shirt" },
      slug: { type: "string", example: "black-oversized-t-shirt" },
    },
  },

  ReviewDetail: {
    type: "object",
    properties: {
      id: { type: "integer", example: 12 },
      userId: { type: "integer", example: 1 },
      productId: { type: "integer", example: 5 },
      rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
      comment: { type: "string", nullable: true, example: "Absolutely love this tee! Super soft and the fit is perfect." },
      images: {
        type: "array",
        items: { type: "string", format: "uri" },
        example: ["https://cdn.trusttees.com/reviews/review-1.jpg"],
      },
      verified: { type: "boolean", example: true, description: "True if user has a DELIVERED order for this product" },
      isApproved: { type: "boolean", example: true, description: "Whether the review is approved (auto-approved by default)" },
      helpful: { type: "integer", example: 7 },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      user: { $ref: "#/components/schemas/ReviewUser" },
      product: { $ref: "#/components/schemas/ReviewProduct" },
    },
  },

  CreateReviewRequest: {
    type: "object",
    required: ["productId", "rating"],
    properties: {
      productId: { type: "integer", example: 5 },
      rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
      comment: { type: "string", example: "Absolutely love this tee! Super soft and the fit is perfect.", maxLength: 1000 },
      images: {
        type: "array",
        items: { type: "string", format: "uri" },
        maxItems: 5,
        example: ["https://cdn.trusttees.com/reviews/review-1.jpg"],
      },
    },
  },

  UpdateReviewRequest: {
    type: "object",
    properties: {
      rating: { type: "integer", minimum: 1, maximum: 5, example: 4 },
      comment: { type: "string", example: "Updated: Great quality, washes well too.", maxLength: 1000 },
      images: {
        type: "array",
        items: { type: "string", format: "uri" },
        maxItems: 5,
      },
    },
  },

  ReviewResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Review submitted successfully. It will be visible once approved by our team." },
      data: { $ref: "#/components/schemas/ReviewDetail" },
    },
  },

  RatingDistribution: {
    type: "object",
    description: "Count of approved reviews per star rating (1–5)",
    properties: {
      "1": { type: "integer", example: 2 },
      "2": { type: "integer", example: 3 },
      "3": { type: "integer", example: 5 },
      "4": { type: "integer", example: 12 },
      "5": { type: "integer", example: 28 },
    },
  },

  ProductReviewsResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/ReviewDetail" },
      },
      ratingDistribution: { $ref: "#/components/schemas/RatingDistribution" },
      pagination: { $ref: "#/components/schemas/Pagination" },
    },
  },

  AdminReviewListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/ReviewDetail" },
      },
      pagination: { $ref: "#/components/schemas/Pagination" },
    },
  },

  HelpfulResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Marked as helpful." },
      data: {
        type: "object",
        properties: {
          helpful: { type: "integer", example: 8 },
        },
      },
    },
  },

  SuccessMessageResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Deleted successfully." },
    },
  },

  // ─── Ticket Schemas ─────────────────────────────────────────────────

  SupportTicket: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      ticketNumber: { type: "string", example: "TKT-8A3X2B-1E" },
      userId: { type: "integer", example: 1 },
      subject: { type: "string", example: "Defective item received" },
      message: { type: "string", example: "The oversized black t-shirt I ordered has a tear on the sleeve." },
      priority: { type: "string", example: "HIGH" },
      status: { type: "string", example: "OPEN" },
      adminResponse: { type: "string", nullable: true, example: "We apologize for this. We have approved a replacement." },
      attachments: { type: "string", nullable: true, example: "https://res.cloudinary.com/demo/image/upload/v1/reviews/defect.jpg" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      customer: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Priya Panchal" },
          email: { type: "string", example: "priya@gmail.com" },
          phone: { type: "string", nullable: true, example: "9876543210" },
        },
      },
    },
  },

  CreateTicketRequest: {
    type: "object",
    required: ["subject", "message"],
    properties: {
      subject: { type: "string", example: "Defective item received" },
      message: { type: "string", example: "The oversized black t-shirt I ordered has a tear on the sleeve." },
      priority: { type: "string", enum: ["LOW", "NORMAL", "HIGH", "URGENT"], example: "NORMAL" },
      attachments: { type: "string", example: "https://res.cloudinary.com/demo/image/upload/v1/reviews/defect.jpg" },
    },
  },

  UpdateTicketStatusRequest: {
    type: "object",
    required: ["status"],
    properties: {
      status: { type: "string", enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"], example: "RESOLVED" },
      adminResponse: { type: "string", example: "We apologize for this. We have approved a replacement." },
    },
  },

  TicketResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Support ticket raised successfully" },
      data: { $ref: "#/components/schemas/SupportTicket" },
    },
  },

  TicketListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/SupportTicket" },
      },
      pagination: { $ref: "#/components/schemas/Pagination" },
    },
  },
};

