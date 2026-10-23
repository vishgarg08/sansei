import { jsonRef } from "./helpers";

export const homePaths = {
  "/api/v1/home": {
    get: {
      tags: ["Home"],
      operationId: "getHomePageData",
      summary: "Fetch storefront home data in one request",
      description:
        "Returns active banners, featured products, best sellers, new arrivals, trending products, and categories for the home page.",
      responses: {
        "200": {
          description: "Home page data fetched successfully",
          content: jsonRef("#/components/schemas/HomeResponse"),
        },
      },
    },
  },
};
