import { authPaths } from "./auth.swagger";
import { cartPaths } from "./cart.swagger";
import { categoryPaths } from "./categories.swagger";
import { dropdownPaths } from "./dropdowns.swagger";
import { homePaths } from "./home.swagger";
import { productPaths } from "./products.swagger";
import { schemas, securitySchemes, tags } from "./schemas";
import { subCategoryPaths } from "./subcategories.swagger";
import { variantPaths } from "./variants.swagger";
import { wishlistPaths } from "./wishlist.swagger";
import { addressPaths } from "./address.swagger";
import { couponPaths } from "./coupon.swagger";
import { checkoutPaths } from "./checkout.swagger";
import { paymentPaths } from "./payment.swagger";
import { orderPaths } from "./order.swagger";
import { adminOrderPaths } from "./admin-order.swagger";
import { inventoryPaths } from "./inventory.swagger";
import { reviewPaths } from "./review.swagger";
import { ticketPaths } from "./ticket.swagger";

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Trusttees Backend API",
    version: "1.0.0",
    description:
      "Swagger documentation for Trusttees authentication, catalog, storefront, cart, wishlist, product media, checkout, payment, order management, and inventory management APIs.",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Local development server",
    },
  ],
  tags,
  components: {
    securitySchemes,
    schemas,
  },
  paths: {
    "/api/v1/health": {
      get: {
        operationId: "getHealthStatus",
        summary: "Health check",
        tags: ["Home"],
        responses: {
          "200": {
            description: "API is running",
          },
        },
      },
    },
    ...authPaths,
    ...categoryPaths,
    ...dropdownPaths,
    ...subCategoryPaths,
    ...productPaths,
    ...variantPaths,
    ...cartPaths,
    ...wishlistPaths,
    ...addressPaths,
    ...couponPaths,
    ...checkoutPaths,
    ...paymentPaths,
    ...orderPaths,
    ...adminOrderPaths,
    ...inventoryPaths,
    ...reviewPaths,
    ...ticketPaths,
    ...homePaths,
  },
};
