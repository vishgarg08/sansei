import { Prisma, InventoryAction } from "@prisma/client";
import { prisma } from "../prisma/prisma";
import { AppError } from "../utils/appError";
import type {
  InventoryLogQuery,
  LowStockQuery,
} from "../types/inventory";

// ─── Serializers ─────────────────────────────────────────────────────────────

const serializeInventoryLog = (log: any) => ({
  id: log.id,
  productId: log.productId,
  productName: log.product?.name ?? null,
  productSku: log.product?.sku ?? null,
  variantId: log.variantId,
  variantSku: log.variant?.sku ?? null,
  variantSize: log.variant?.size ?? null,
  variantColor: log.variant?.color ?? null,
  action: log.action,
  quantityChanged: log.quantityChanged,
  previousStock: log.previousStock,
  newStock: log.newStock,
  reference: log.reference,
  notes: log.notes,
  createdAt: log.createdAt,
});

// ─── Service: Get Inventory Logs (Admin) ─────────────────────────────────────

/**
 * Returns paginated inventory logs with optional filters.
 * Essential for fashion brands who need full stock history.
 */
export const getInventoryLogs = async (query: InventoryLogQuery) => {
  const { page, limit, productId, variantId, action, reference, dateFrom, dateTo } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.InventoryLogWhereInput = {
    ...(productId && { productId }),
    ...(variantId && { variantId }),
    ...(action && { action }),
    ...(reference && {
      reference: { contains: reference, mode: "insensitive" as const },
    }),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom && { gte: dateFrom }),
            ...(dateTo && { lte: dateTo }),
          },
        }
      : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.inventoryLog.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        variant: {
          select: { id: true, sku: true, size: true, color: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.inventoryLog.count({ where }),
  ]);

  return {
    logs: logs.map(serializeInventoryLog),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

// ─── Service: Get Logs for a Specific Variant ────────────────────────────────

/**
 * Returns all inventory logs for a specific variant.
 * Useful for auditing a single product's stock history.
 */
export const getVariantInventoryLogs = async (
  productId: number,
  variantId: number,
  page: number,
  limit: number
) => {
  // Validate product + variant exist
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
    select: { id: true, sku: true, size: true, color: true, stock: true, reservedStock: true },
  });

  if (!variant) {
    throw new AppError("Variant not found for this product", 404);
  }

  const skip = (page - 1) * limit;
  const where: Prisma.InventoryLogWhereInput = { productId, variantId };

  const [logs, total] = await Promise.all([
    prisma.inventoryLog.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        variant: { select: { id: true, sku: true, size: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.inventoryLog.count({ where }),
  ]);

  return {
    variant: {
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      reservedStock: variant.reservedStock,
      availableStock: Math.max(variant.stock - variant.reservedStock, 0),
    },
    logs: logs.map(serializeInventoryLog),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

// ─── Service: Low Stock Alert ─────────────────────────────────────────────────

/**
 * Returns product variants whose available stock (stock - reservedStock) is
 * at or below the given threshold. Perfect for restocking decisions.
 */
export const getLowStockVariants = async (query: LowStockQuery) => {
  const { threshold = 10, page, limit } = query;
  const skip = (page - 1) * limit;

  // We need availableStock = stock - reservedStock <= threshold
  // Prisma doesn't support column-column comparisons natively, so we use a workaround:
  // stock - reservedStock <= threshold  ↔  stock <= reservedStock + threshold
  const [variants, total] = await Promise.all([
    prisma.productVariant.findMany({
      where: {
        product: { deletedAt: null, isActive: true },
      },
      include: {
        product: {
          select: { id: true, name: true, slug: true, sku: true },
        },
      },
      orderBy: { stock: "asc" },
      skip,
      take: limit * 5, // over-fetch, then filter in-memory
    }),
    prisma.productVariant.count({
      where: {
        product: { deletedAt: null, isActive: true },
      },
    }),
  ]);

  // Filter to only low-stock variants
  const lowStockVariants = variants.filter(
    (v) => Math.max(v.stock - v.reservedStock, 0) <= threshold
  );

  const paginated = lowStockVariants.slice(0, limit);

  return {
    threshold,
    variants: paginated.map((v) => ({
      id: v.id,
      productId: v.productId,
      productName: v.product.name,
      productSku: v.product.sku,
      productSlug: v.product.slug,
      sku: v.sku,
      size: v.size,
      color: v.color,
      stock: v.stock,
      reservedStock: v.reservedStock,
      availableStock: Math.max(v.stock - v.reservedStock, 0),
    })),
    total: lowStockVariants.length,
  };
};

// ─── Service: Inventory Dashboard Summary ────────────────────────────────────

/**
 * High-level inventory stats for the admin dashboard.
 * - Total products
 * - Total variants
 * - Total stock units
 * - Total reserved units
 * - Out-of-stock variants count
 * - Low-stock variants count (below threshold)
 * - Recent inventory activity summary (last 7 days by action)
 */
export const getInventoryDashboard = async (lowStockThreshold = 10) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalVariants,
    variantStockAgg,
    recentLogs,
    outOfStockCount,
    lowStockCount,
  ] = await Promise.all([
    // Count all active variants
    prisma.productVariant.count({
      where: { product: { deletedAt: null, isActive: true } },
    }),

    // Aggregate total stock + reserved stock
    prisma.productVariant.aggregate({
      _sum: { stock: true, reservedStock: true },
      where: { product: { deletedAt: null, isActive: true } },
    }),

    // Last 7 days logs grouped by action
    prisma.inventoryLog.groupBy({
      by: ["action"],
      _count: { id: true },
      _sum: { quantityChanged: true },
      where: { createdAt: { gte: sevenDaysAgo } },
    }),

    // Out of stock (stock - reservedStock <= 0)
    prisma.productVariant.count({
      where: {
        product: { deletedAt: null, isActive: true },
        stock: { lte: 0 },
      },
    }),

    // Low stock (stock <= threshold — approximation, exact needs raw SQL)
    prisma.productVariant.count({
      where: {
        product: { deletedAt: null, isActive: true },
        stock: { lte: lowStockThreshold },
      },
    }),
  ]);

  const totalStock = variantStockAgg._sum.stock ?? 0;
  const totalReserved = variantStockAgg._sum.reservedStock ?? 0;

  const activityByAction: Record<string, { count: number; totalQty: number }> = {};
  for (const log of recentLogs) {
    activityByAction[log.action] = {
      count: log._count.id,
      totalQty: log._sum.quantityChanged ?? 0,
    };
  }

  return {
    summary: {
      totalVariants,
      totalStock,
      totalReserved,
      totalAvailable: Math.max(totalStock - totalReserved, 0),
      outOfStockVariants: outOfStockCount,
      lowStockVariants: lowStockCount,
      lowStockThreshold,
    },
    recentActivity: {
      periodDays: 7,
      byAction: activityByAction,
    },
  };
};
