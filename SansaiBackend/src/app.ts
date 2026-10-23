import express from "express";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth";
import cartRoutes from "./routes/cart";
import categoryRoutes from "./routes/categories";
import dropdownRoutes from "./routes/dropdowns";
import homeRoutes from "./routes/home";
import productRoutes from "./routes/products";
import subCategoryRoutes from "./routes/subcategories";
import variantRoutes from "./routes/variants";
import wishlistRoutes from "./routes/wishlist";
import addressRoutes from "./routes/addresses";
import couponRoutes from "./routes/coupons";
import checkoutRoutes from "./routes/checkout";
import paymentRoutes from "./routes/payments";
import orderRoutes from "./routes/orders";
import adminOrderRoutes from "./routes/admin-orders";
import adminDashboardRoutes from "./routes/admin-dashboard";
import adminInventoryRoutes from "./routes/admin-inventory";
import reviewRoutes from "./routes/reviews";
import productReviewRoutes from "./routes/product-reviews";
import adminReviewRoutes from "./routes/admin-reviews";
import ticketRoutes from "./routes/tickets";
import adminTicketRoutes from "./routes/admin-tickets";
import adminCustomerRoutes from "./routes/admin-customers";
import bulkInquiryRoutes from "./routes/bulk-inquiries";
import adminBannerRoutes from "./routes/admin-banners";
import { env } from "./config/env";
import { requestLogger } from "./config/logger";
import { apiLimiter, authLimiter, securityMiddleware } from "./config/security";
import { errorHandler } from "./middleware/errorHandler";
import { swaggerDocument } from "./config/swagger";

const app = express();
const apiBasePath = "/api/v1";
const authBasePath = `${apiBasePath}/auth`;
const cartBasePath = `${apiBasePath}/cart`;
const categoryBasePath = `${apiBasePath}/categories`;
const dropdownBasePath = `${apiBasePath}/dropdowns`;
const homeBasePath = `${apiBasePath}/home`;
const productBasePath = `${apiBasePath}/products`;
const subCategoryBasePath = `${apiBasePath}/subcategories`;
const variantBasePath = `${apiBasePath}/products/:productId/variants`;
const wishlistBasePath = `${apiBasePath}/wishlist`;
const addressesBasePath = `${apiBasePath}/addresses`;
const couponBasePath = `${apiBasePath}/coupons`;
const checkoutBasePath = `${apiBasePath}/checkout`;
const paymentBasePath = `${apiBasePath}/payments`;
const orderBasePath = `${apiBasePath}/orders`;
const adminOrderBasePath = `${apiBasePath}/admin/orders`;
const adminDashboardBasePath = `${apiBasePath}/admin/dashboard`;
const adminInventoryBasePath = `${apiBasePath}/admin/inventory`;
const reviewBasePath = `${apiBasePath}/reviews`;
const adminReviewBasePath = `${apiBasePath}/admin/reviews`;
const ticketBasePath = `${apiBasePath}/tickets`;
const adminTicketBasePath = `${apiBasePath}/admin/tickets`;
const adminCustomerBasePath = `${apiBasePath}/admin/customers`;
const bulkInquiryBasePath = `${apiBasePath}/bulk-inquiries`;
const adminBannerBasePath = `${apiBasePath}/admin/banners`;
const bannerBasePath = `${apiBasePath}/banners`;

app.set("trust proxy", env.trustProxy);
app.disable("x-powered-by");
app.locals.isShuttingDown = false;

app.use(requestLogger);
app.use(securityMiddleware.helmet);
app.use(securityMiddleware.cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (app.locals.isShuttingDown) {
    res.setHeader("Connection", "close");
    res.status(503).json({
      success: false,
      message: "Server is restarting. Please retry shortly.",
    });
    return;
  }

  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Trusttees API is running",
    version: "v1",
    docs: `${req.protocol}://${req.get("host")}${apiBasePath}/docs`,
  });
});

app.get(`${apiBasePath}/health`, (_req, res) => {
  res.json({
    success: true,
    status: app.locals.isShuttingDown ? "shutting_down" : "ok",
  });
});

app.use(apiBasePath, apiLimiter);

app.use(`${apiBasePath}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get(`${apiBasePath}/docs.json`, (_req, res) => {
  res.json(swaggerDocument);
});
// Auth routes
app.use(authBasePath, authLimiter, authRoutes);
app.use(cartBasePath, cartRoutes);
app.use(categoryBasePath, categoryRoutes);
app.use(dropdownBasePath, dropdownRoutes);
app.use(homeBasePath, homeRoutes);
app.use(productBasePath, productRoutes);
app.use(subCategoryBasePath, subCategoryRoutes);
app.use(variantBasePath, variantRoutes);
app.use(wishlistBasePath, wishlistRoutes);
app.use(addressesBasePath, addressRoutes);
app.use(couponBasePath, couponRoutes);
app.use(checkoutBasePath, checkoutRoutes);
app.use(paymentBasePath, paymentRoutes);
app.use(orderBasePath, orderRoutes);
app.use(adminOrderBasePath, adminOrderRoutes);
app.use(adminDashboardBasePath, adminDashboardRoutes);
app.use(adminInventoryBasePath, adminInventoryRoutes);
app.use(reviewBasePath, reviewRoutes);
app.use(productBasePath, productReviewRoutes);
app.use(adminReviewBasePath, adminReviewRoutes);
app.use(ticketBasePath, ticketRoutes);
app.use(adminTicketBasePath, adminTicketRoutes);
app.use(adminCustomerBasePath, adminCustomerRoutes);
app.use(bulkInquiryBasePath, bulkInquiryRoutes);
app.use(adminBannerBasePath, adminBannerRoutes);
app.use(bannerBasePath, adminBannerRoutes);
app.use(errorHandler);

export default app;
