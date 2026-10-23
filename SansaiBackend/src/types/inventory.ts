import type { InventoryAction } from "@prisma/client";

// ─── Query Types ──────────────────────────────────────────────────────────────

export type InventoryLogQuery = {
  page: number;
  limit: number;
  productId?: number;
  variantId?: number;
  action?: InventoryAction;
  reference?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

export type LowStockQuery = {
  threshold?: number; // default: 10
  page: number;
  limit: number;
};

// ─── Response Types ───────────────────────────────────────────────────────────

export type SerializedInventoryLog = {
  id: number;
  productId: number;
  productName: string | null;
  productSku: string | null;
  variantId: number;
  variantSku: string | null;
  variantSize: string | null;
  variantColor: string | null;
  action: InventoryAction;
  quantityChanged: number;
  previousStock: number;
  newStock: number;
  reference: string | null;
  notes: string | null;
  createdAt: Date;
};

export type InventoryLogPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type LowStockVariant = {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  productSlug: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
};

export type InventoryDashboardSummary = {
  totalVariants: number;
  totalStock: number;
  totalReserved: number;
  totalAvailable: number;
  outOfStockVariants: number;
  lowStockVariants: number;
  lowStockThreshold: number;
};

export type InventoryActivityByAction = Record<
  string,
  { count: number; totalQty: number }
>;
