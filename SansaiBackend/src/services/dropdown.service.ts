import { prisma, pool } from "../prisma/prisma";
import type {
  CategoryDropdownItem,
  SubCategoryDropdownItem,
  DistinctValueItem,
  SizesColorsResult,
  ProductFormData,
} from "../types/dropdown";

/**
 * Active categories — Prisma (simple lookup).
 */
export const getCategoriesDropdown = async (): Promise<CategoryDropdownItem[]> => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return categories;
};

/**
 * Active subcategories filtered by optional categoryId — Prisma.
 */
export const getSubCategoriesDropdown = async (
  categoryId?: number
): Promise<SubCategoryDropdownItem[]> => {
  const subcategories = await prisma.subCategory.findMany({
    where: {
      isActive: true,
      category: { isActive: true },
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      categoryId: true,
    },
  });

  return subcategories;
};

// ─── Raw SQL dropdowns (aggregate queries for performance) ───────────────────

/**
 * Distinct sizes across all active product variants — Raw SQL.
 *
 * Uses a JOIN on products to ensure we only return sizes from
 * active, non-deleted products with active categories.
 */
export const getDistinctSizes = async (): Promise<DistinctValueItem[]> => {
  const result = await pool.query<{ value: string; count: string }>(
    `SELECT
       pv.size AS value,
       COUNT(*)::text AS count
     FROM "ProductVariant" pv
     JOIN "Product" p ON p.id = pv."productId"
     JOIN "Category" c ON c.id = p."categoryId"
     WHERE p."deletedAt" IS NULL
       AND p."isActive" = true
       AND c."isActive" = true
       AND pv.stock > 0
     GROUP BY pv.size
     ORDER BY pv.size ASC`
  );

  return result.rows.map((row) => ({
    value: row.value,
    count: Number(row.count),
  }));
};

/**
 * Distinct colors across all active product variants — Raw SQL.
 */
export const getDistinctColors = async (): Promise<DistinctValueItem[]> => {
  const result = await pool.query<{ value: string; count: string }>(
    `SELECT
       pv.color AS value,
       COUNT(*)::text AS count
     FROM "ProductVariant" pv
     JOIN "Product" p ON p.id = pv."productId"
     JOIN "Category" c ON c.id = p."categoryId"
     WHERE p."deletedAt" IS NULL
       AND p."isActive" = true
       AND c."isActive" = true
       AND pv.stock > 0
     GROUP BY pv.color
     ORDER BY pv.color ASC`
  );

  return result.rows.map((row) => ({
    value: row.value,
    count: Number(row.count),
  }));
};

/**
 * Sizes and colors for a specific product's variants — Raw SQL.
 */
export const getProductSizesAndColors = async (
  productId: number
): Promise<SizesColorsResult> => {
  const [sizesResult, colorsResult] = await Promise.all([
    pool.query<{ value: string; count: string }>(
      `SELECT
         pv.size AS value,
         COUNT(*)::text AS count
       FROM "ProductVariant" pv
       WHERE pv."productId" = $1
       GROUP BY pv.size
       ORDER BY pv.size ASC`,
      [productId]
    ),
    pool.query<{ value: string; count: string }>(
      `SELECT
         pv.color AS value,
         COUNT(*)::text AS count
       FROM "ProductVariant" pv
       WHERE pv."productId" = $1
       GROUP BY pv.color
       ORDER BY pv.color ASC`,
      [productId]
    ),
  ]);

  return {
    sizes: sizesResult.rows.map((row) => ({
      value: row.value,
      count: Number(row.count),
    })),
    colors: colorsResult.rows.map((row) => ({
      value: row.value,
      count: Number(row.count),
    })),
  };
};

/**
 * Combined product form data — Raw SQL multi-query optimization.
 *
 * Returns categories, subcategories (filtered by optional categoryId),
 * distinct sizes, and distinct colors in a single handler.
 * Uses parallel queries to minimize latency.
 */
export const getProductFormData = async (
  categoryId?: number
): Promise<ProductFormData> => {
  const [categories, subcategories, sizes, colors] = await Promise.all([
    getCategoriesDropdown(),
    getSubCategoriesDropdown(categoryId),
    getDistinctSizes(),
    getDistinctColors(),
  ]);

  return {
    categories,
    subcategories,
    sizes,
    colors,
  };
};
