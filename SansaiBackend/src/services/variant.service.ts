import { Prisma, InventoryAction } from "@prisma/client";
import { prisma, pool } from "../prisma/prisma";
import { AppError } from "../utils/appError";
import { variantSelect } from "../types/variant";
import type {
  CreateVariantInput,
  UpdateVariantInput,
  UpdateStockInput,
  BulkStockInput,
  VariantRecord,
  VariantStockSummaryRow,
  ProductStockSummary,
} from "../types/variant";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const trimRequired = (value: string): string => value.trim();

const toNullableNumber = (value: Prisma.Decimal | null): number | null =>
  value === null ? null : Number(value.toString());

const serializeVariant = (variant: VariantRecord) => ({
  id: variant.id,
  productId: variant.productId,
  size: variant.size,
  color: variant.color,
  sku: variant.sku,
  price: toNullableNumber(variant.price),
  stock: variant.stock,
  reservedStock: variant.reservedStock,
  availableStock: Math.max(variant.stock - variant.reservedStock, 0),
  createdAt: variant.createdAt,
  updatedAt: variant.updatedAt,
});

const ensureProductExists = async (productId: number): Promise<void> => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }
};

const getVariantOrThrow = async (
  productId: number,
  variantId: number
): Promise<VariantRecord> => {
  const variant = await prisma.productVariant.findFirst({
    where: {
      id: variantId,
      productId,
    },
    select: variantSelect,
  });

  if (!variant) {
    throw new AppError("Variant not found", 404);
  }

  return variant;
};

const mapVariantUniqueConstraintError = (
  error: Prisma.PrismaClientKnownRequestError
): never => {
  const target = Array.isArray(error.meta?.target)
    ? error.meta.target.join(", ")
    : String(error.meta?.target ?? "");

  if (target.includes("sku")) {
    throw new AppError("A variant with this SKU already exists", 409);
  }

  if (target.includes("productId") && target.includes("size") && target.includes("color")) {
    throw new AppError("A variant with this size and color combination already exists for this product", 409);
  }

  throw new AppError("A variant with the provided unique values already exists", 409);
};

const handleVariantWriteError = (error: unknown): never => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      mapVariantUniqueConstraintError(error);
    }

    if (error.code === "P2003") {
      throw new AppError("Unable to complete operation because the variant is already referenced", 400);
    }
  }

  throw error;
};

/**
 * Compute stock delta based on inventory action.
 */
const resolveStockDelta = (action: InventoryAction, quantity: number): number => {
  switch (action) {
    case "IN":
    case "RETURN":
      return quantity;
    case "OUT":
    case "CANCELLED":
      return -quantity;
    case "MANUAL":
      return quantity; // Positive = add, negative = subtract (caller controls sign)
    default:
      throw new AppError(`Unknown inventory action: ${action}`, 400);
  }
};

// ─── Service Functions (Prisma-based CRUD) ───────────────────────────────────

/**
 * List all variants for a product — Prisma.
 */
export const listVariants = async (productId: number) => {
  await ensureProductExists(productId);

  const variants = await prisma.productVariant.findMany({
    where: { productId },
    orderBy: [{ id: "asc" }],
    select: variantSelect,
  });

  return variants.map(serializeVariant);
};

/**
 * Get a single variant by ID — Prisma.
 */
export const getVariantById = async (productId: number, variantId: number) => {
  await ensureProductExists(productId);
  const variant = await getVariantOrThrow(productId, variantId);
  return serializeVariant(variant);
};

/**
 * Add one or more variants to a product — Prisma (transaction).
 */
export const createVariants = async (productId: number, inputs: CreateVariantInput[]) => {
  await ensureProductExists(productId);

  // Validate uniqueness within the request payload
  const seenSkus = new Set<string>();
  const seenCombinations = new Set<string>();

  for (const input of inputs) {
    const normalizedSku = trimRequired(input.sku).toLowerCase();
    const combination = `${trimRequired(input.size).toLowerCase()}::${trimRequired(input.color).toLowerCase()}`;

    if (seenSkus.has(normalizedSku)) {
      throw new AppError("Variant SKU values must be unique within the request", 400);
    }

    if (seenCombinations.has(combination)) {
      throw new AppError("Variant size and color combinations must be unique within the request", 400);
    }

    seenSkus.add(normalizedSku);
    seenCombinations.add(combination);
  }

  try {
    const variants = await prisma.$transaction(async (tx) => {
      const created: VariantRecord[] = [];

      for (const input of inputs) {
        const variant = await tx.productVariant.create({
          data: {
            productId,
            size: trimRequired(input.size),
            color: trimRequired(input.color),
            sku: trimRequired(input.sku),
            price: input.price ?? null,
            stock: input.stock ?? 0,
            reservedStock: 0,
          },
          select: variantSelect,
        });

        // Log initial stock if provided
        if (input.stock && input.stock > 0) {
          await tx.inventoryLog.create({
            data: {
              productId,
              variantId: variant.id,
              action: "IN",
              quantityChanged: input.stock,
              previousStock: 0,
              newStock: input.stock,
              reference: "VARIANT_CREATED",
              notes: `Initial stock on variant creation`,
            },
          });
        }

        created.push(variant);
      }

      return created;
    });

    return variants.map(serializeVariant);
  } catch (error) {
    handleVariantWriteError(error);
  }
};

/**
 * Update a single variant — Prisma.
 */
export const updateVariant = async (
  productId: number,
  variantId: number,
  input: UpdateVariantInput
) => {
  await ensureProductExists(productId);
  const existingVariant = await getVariantOrThrow(productId, variantId);

  try {
    const variant = await prisma.$transaction(async (tx) => {
      const updatedVariant = await tx.productVariant.update({
        where: { id: variantId },
        data: {
          size: input.size !== undefined ? trimRequired(input.size) : undefined,
          color: input.color !== undefined ? trimRequired(input.color) : undefined,
          sku: input.sku !== undefined ? trimRequired(input.sku) : undefined,
          price: input.price !== undefined ? input.price ?? null : undefined,
          stock: input.stock !== undefined ? input.stock : undefined,
        },
        select: variantSelect,
      });

      // If stock was explicitly changed, log the inventory adjustment
      if (input.stock !== undefined && input.stock !== existingVariant.stock) {
        const delta = input.stock - existingVariant.stock;

        await tx.inventoryLog.create({
          data: {
            productId,
            variantId,
            action: "MANUAL",
            quantityChanged: Math.abs(delta),
            previousStock: existingVariant.stock,
            newStock: input.stock,
            reference: "VARIANT_UPDATED",
            notes: `Stock adjusted from ${existingVariant.stock} to ${input.stock}`,
          },
        });
      }

      return updatedVariant;
    });

    return serializeVariant(variant);
  } catch (error) {
    handleVariantWriteError(error);
  }
};

/**
 * Delete a variant (with safety checks) — Prisma.
 */
export const deleteVariant = async (productId: number, variantId: number): Promise<void> => {
  await ensureProductExists(productId);
  await getVariantOrThrow(productId, variantId);

  // Check if variant is referenced by carts, orders, or inventory logs
  const [cartCount, orderItemCount] = await Promise.all([
    prisma.cart.count({
      where: { productId, variantId },
    }),
    prisma.orderItem.count({
      where: { productId, variantId },
    }),
  ]);

  if (cartCount > 0 || orderItemCount > 0) {
    throw new AppError(
      "This variant cannot be deleted because it is referenced by existing cart items or orders",
      400
    );
  }

  await prisma.$transaction(async (tx) => {
    // Delete inventory logs first (no cascade)
    await tx.inventoryLog.deleteMany({
      where: { productId, variantId },
    });

    await tx.productVariant.delete({
      where: { id: variantId },
    });
  });
};

/**
 * Update stock for a single variant — Prisma (transaction with inventory log).
 */
export const updateVariantStock = async (
  productId: number,
  variantId: number,
  input: UpdateStockInput
) => {
  await ensureProductExists(productId);
  const existingVariant = await getVariantOrThrow(productId, variantId);

  const delta = resolveStockDelta(input.action, input.quantity);
  const newStock = existingVariant.stock + delta;

  if (newStock < 0) {
    throw new AppError(
      `Insufficient stock. Current: ${existingVariant.stock}, requested change: ${delta}`,
      400
    );
  }

  const variant = await prisma.$transaction(async (tx) => {
    const updatedVariant = await tx.productVariant.update({
      where: { id: variantId },
      data: { stock: newStock },
      select: variantSelect,
    });

    await tx.inventoryLog.create({
      data: {
        productId,
        variantId,
        action: input.action,
        quantityChanged: input.quantity,
        previousStock: existingVariant.stock,
        newStock,
        reference: input.reference ?? null,
        notes: input.notes ?? null,
      },
    });

    return updatedVariant;
  });

  return serializeVariant(variant);
};

// ─── Raw SQL operations (performance-critical bulk/aggregate) ────────────────

/**
 * Bulk stock update — Raw SQL (batch UPDATE + inventory logging).
 *
 * Uses a Prisma transaction wrapper with raw SQL-like logic for
 * each item to maintain atomicity while being efficient.
 */
export const bulkUpdateStock = async (productId: number, input: BulkStockInput) => {
  await ensureProductExists(productId);

  if (input.items.length === 0) {
    throw new AppError("At least one stock update item is required", 400);
  }

  // Validate all variant IDs belong to this product
  const variantIds = input.items.map((item) => item.variantId);
  const uniqueVariantIds = [...new Set(variantIds)];

  if (uniqueVariantIds.length !== variantIds.length) {
    throw new AppError("Duplicate variant IDs in bulk update request", 400);
  }

  // Use raw SQL to fetch current stock in one query
  const currentStockResult = await pool.query<{
    id: string;
    stock: string;
  }>(
    `SELECT id::text, stock::text
     FROM "ProductVariant"
     WHERE "productId" = $1 AND id = ANY($2::int[])`,
    [productId, uniqueVariantIds]
  );

  if (currentStockResult.rows.length !== uniqueVariantIds.length) {
    const foundIds = new Set(currentStockResult.rows.map((row) => Number(row.id)));
    const missingIds = uniqueVariantIds.filter((id) => !foundIds.has(id));
    throw new AppError(`Variants not found: ${missingIds.join(", ")}`, 404);
  }

  const stockMap = new Map(
    currentStockResult.rows.map((row) => [Number(row.id), Number(row.stock)])
  );

  // Validate all stock changes are valid
  const updates: Array<{
    variantId: number;
    previousStock: number;
    newStock: number;
    action: InventoryAction;
    quantity: number;
    reference: string | null;
    notes: string | null;
  }> = [];

  for (const item of input.items) {
    const currentStock = stockMap.get(item.variantId)!;
    const delta = resolveStockDelta(item.action, item.quantity);
    const newStock = currentStock + delta;

    if (newStock < 0) {
      throw new AppError(
        `Insufficient stock for variant ${item.variantId}. Current: ${currentStock}, requested change: ${delta}`,
        400
      );
    }

    updates.push({
      variantId: item.variantId,
      previousStock: currentStock,
      newStock,
      action: item.action,
      quantity: item.quantity,
      reference: item.reference ?? null,
      notes: item.notes ?? null,
    });
  }

  // Execute all updates and inventory logs in a single transaction
  const results = await prisma.$transaction(async (tx) => {
    const updatedVariants: VariantRecord[] = [];

    for (const update of updates) {
      const variant = await tx.productVariant.update({
        where: { id: update.variantId },
        data: { stock: update.newStock },
        select: variantSelect,
      });

      await tx.inventoryLog.create({
        data: {
          productId,
          variantId: update.variantId,
          action: update.action,
          quantityChanged: update.quantity,
          previousStock: update.previousStock,
          newStock: update.newStock,
          reference: update.reference,
          notes: update.notes,
        },
      });

      updatedVariants.push(variant);
    }

    return updatedVariants;
  });

  return results.map(serializeVariant);
};

/**
 * Stock summary for a product — Raw SQL (aggregate join).
 *
 * Uses a single SQL query with aggregate functions instead of
 * loading all variants into memory.
 */
export const getStockSummary = async (productId: number): Promise<ProductStockSummary> => {
  await ensureProductExists(productId);

  const result = await pool.query<VariantStockSummaryRow>(
    `SELECT
       pv.id::text AS variant_id,
       pv.sku,
       pv.size,
       pv.color,
       pv.stock::text,
       pv."reservedStock"::text AS reserved_stock,
       GREATEST(pv.stock - pv."reservedStock", 0)::text AS available_stock,
       pv.price::text AS price
     FROM "ProductVariant" pv
     WHERE pv."productId" = $1
     ORDER BY pv.id ASC`,
    [productId]
  );

  const variants = result.rows.map((row) => ({
    id: Number(row.variant_id),
    sku: row.sku,
    size: row.size,
    color: row.color,
    stock: Number(row.stock),
    reservedStock: Number(row.reserved_stock),
    availableStock: Number(row.available_stock),
    price: row.price !== null ? Number(row.price) : null,
  }));

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  const totalReservedStock = variants.reduce((sum, v) => sum + v.reservedStock, 0);
  const totalAvailableStock = variants.reduce((sum, v) => sum + v.availableStock, 0);

  return {
    productId,
    totalStock,
    totalReservedStock,
    totalAvailableStock,
    inStock: totalAvailableStock > 0,
    variants,
  };
};
