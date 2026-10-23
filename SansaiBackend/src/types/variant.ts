import { Prisma, InventoryAction } from "@prisma/client";

// ─── Prisma Select & Record ──────────────────────────────────────────────────

export const variantSelect = {
  id: true,
  productId: true,
  size: true,
  color: true,
  sku: true,
  price: true,
  stock: true,
  reservedStock: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type VariantRecord = Prisma.ProductVariantGetPayload<{
  select: typeof variantSelect;
}>;

// ─── Input Types ─────────────────────────────────────────────────────────────

export type CreateVariantInput = {
  size: string;
  color: string;
  sku: string;
  price?: number | null;
  stock?: number;
};

export type UpdateVariantInput = {
  size?: string;
  color?: string;
  sku?: string;
  price?: number | null;
  stock?: number;
};

export type UpdateStockInput = {
  action: InventoryAction;
  quantity: number;
  reference?: string;
  notes?: string;
};

export type BulkStockItem = {
  variantId: number;
  action: InventoryAction;
  quantity: number;
  reference?: string;
  notes?: string;
};

export type BulkStockInput = {
  items: BulkStockItem[];
};

// ─── Raw SQL Row Types ───────────────────────────────────────────────────────

export type VariantStockSummaryRow = {
  variant_id: string;
  sku: string;
  size: string;
  color: string;
  stock: string;
  reserved_stock: string;
  available_stock: string;
  price: string | null;
};

// ─── Response Types ──────────────────────────────────────────────────────────

export type ProductStockSummary = {
  productId: number;
  totalStock: number;
  totalReservedStock: number;
  totalAvailableStock: number;
  inStock: boolean;
  variants: Array<{
    id: number;
    sku: string;
    size: string;
    color: string;
    stock: number;
    reservedStock: number;
    availableStock: number;
    price: number | null;
  }>;
};
