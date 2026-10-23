import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/prisma";
import { CategoryRecord, categorySelect } from "../types/catalog";
import { AppError } from "../utils/appError";

type CreateCategoryInput = {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  displayOrder?: number;
};

type UpdateCategoryInput = Partial<CreateCategoryInput>;

const trimRequired = (value: string): string => value.trim();

const trimNullable = (
  value: string | null | undefined
): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const buildUniqueCategorySlug = async (
  sourceValue: string,
  excludeCategoryId?: number
): Promise<string> => {
  const baseSlug = slugify(sourceValue);

  if (!baseSlug) {
    throw new AppError("Unable to generate a valid category slug", 400);
  }

  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        slug: candidate,
        ...(excludeCategoryId
          ? {
              NOT: {
                id: excludeCategoryId,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    if (!existingCategory) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

const serializeCategory = (category: CategoryRecord) => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  description: category.description,
  image: category.image,
  isActive: category.isActive,
  displayOrder: category.displayOrder,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
  productCount: category._count.products,
  subCategoryCount: category._count.subcategories,
  subcategories: category.subcategories.map((subCategory) => ({
    id: subCategory.id,
    categoryId: subCategory.categoryId,
    name: subCategory.name,
    slug: subCategory.slug,
    description: subCategory.description,
    image: subCategory.image,
    isActive: subCategory.isActive,
    createdAt: subCategory.createdAt,
    updatedAt: subCategory.updatedAt,
    productCount: subCategory._count.products,
  })),
});

const getCategoryOrThrow = async (
  where: Prisma.CategoryWhereInput
): Promise<CategoryRecord> => {
  const category = await prisma.category.findFirst({
    where,
    select: categorySelect,
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

const mapCategoryUniqueConstraintError = (
  error: Prisma.PrismaClientKnownRequestError
): never => {
  const target = Array.isArray(error.meta?.target)
    ? error.meta.target.join(", ")
    : String(error.meta?.target ?? "");

  if (target.includes("slug")) {
    throw new AppError("A category with this slug already exists", 409);
  }

  if (target.includes("name")) {
    throw new AppError("A category with this name already exists", 409);
  }

  throw new AppError("A category with the provided unique values already exists", 409);
};

const handleCategoryWriteError = (error: unknown): never => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    mapCategoryUniqueConstraintError(error);
  }

  throw error;
};

export const listCategories = async () => {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    select: categorySelect,
  });

  return categories.map(serializeCategory);
};

export const getCategoryById = async (categoryId: number) => {
  const category = await getCategoryOrThrow({
    id: categoryId,
    isActive: true,
  });

  return serializeCategory(category);
};

export const getCategoryBySlug = async (slug: string) => {
  const category = await getCategoryOrThrow({
    slug: trimRequired(slug),
    isActive: true,
  });

  return serializeCategory(category);
};

export const createCategory = async (input: CreateCategoryInput) => {
  const categorySlug = await buildUniqueCategorySlug(input.slug || input.name);

  try {
    const category = await prisma.category.create({
      data: {
        name: trimRequired(input.name),
        slug: categorySlug,
        description: trimNullable(input.description) ?? null,
        image: trimNullable(input.image) ?? null,
        isActive: input.isActive ?? true,
        displayOrder: input.displayOrder ?? 0,
      },
      select: categorySelect,
    });

    return serializeCategory(category);
  } catch (error) {
    handleCategoryWriteError(error);
  }
};

export const updateCategory = async (
  categoryId: number,
  input: UpdateCategoryInput
) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!existingCategory) {
    throw new AppError("Category not found", 404);
  }

  const nextSlug =
    input.slug !== undefined || input.name !== undefined
      ? await buildUniqueCategorySlug(input.slug || input.name || existingCategory.name, categoryId)
      : undefined;

  try {
    const category = await prisma.$transaction(async (tx) => {
      const updatedCategory = await tx.category.update({
        where: { id: categoryId },
        data: {
          name: input.name !== undefined ? trimRequired(input.name) : undefined,
          slug: nextSlug,
          description:
            input.description !== undefined ? trimNullable(input.description) ?? null : undefined,
          image: input.image !== undefined ? trimNullable(input.image) ?? null : undefined,
          isActive: input.isActive,
          displayOrder: input.displayOrder,
        },
      });

      if (input.isActive === false) {
        await Promise.all([
          tx.subCategory.updateMany({
            where: { categoryId },
            data: { isActive: false },
          }),
          tx.product.updateMany({
            where: { categoryId },
            data: { isActive: false },
          }),
        ]);
      }

      return tx.category.findUniqueOrThrow({
        where: { id: updatedCategory.id },
        select: categorySelect,
      });
    });

    return serializeCategory(category);
  } catch (error) {
    handleCategoryWriteError(error);
  }
};

export const deleteCategory = async (categoryId: number): Promise<void> => {
  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!existingCategory) {
    throw new AppError("Category not found", 404);
  }

  await prisma.$transaction(async (tx) => {
    await Promise.all([
      tx.category.update({
        where: { id: categoryId },
        data: { isActive: false },
      }),
      tx.subCategory.updateMany({
        where: { categoryId },
        data: { isActive: false },
      }),
      tx.product.updateMany({
        where: { categoryId },
        data: { isActive: false },
      }),
    ]);
  });
};
