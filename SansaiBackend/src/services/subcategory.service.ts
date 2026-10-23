import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/prisma";
import { SubCategoryRecord, subCategorySelect } from "../types/catalog";
import { AppError } from "../utils/appError";

type CreateSubCategoryInput = {
  categoryId: number;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
};

type UpdateSubCategoryInput = Partial<CreateSubCategoryInput>;

type ListSubCategoriesQuery = {
  categoryId?: number;
};

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

const ensureActiveCategory = async (categoryId: number): Promise<void> => {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }
};

const buildUniqueSubCategorySlug = async (
  sourceValue: string,
  excludeSubCategoryId?: number
): Promise<string> => {
  const baseSlug = slugify(sourceValue);

  if (!baseSlug) {
    throw new AppError("Unable to generate a valid subcategory slug", 400);
  }

  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existingSubCategory = await prisma.subCategory.findFirst({
      where: {
        slug: candidate,
        ...(excludeSubCategoryId
          ? {
              NOT: {
                id: excludeSubCategoryId,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    if (!existingSubCategory) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

const serializeSubCategory = (subCategory: SubCategoryRecord) => ({
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
  category: subCategory.category,
});

const getSubCategoryOrThrow = async (
  where: Prisma.SubCategoryWhereInput
): Promise<SubCategoryRecord> => {
  const subCategory = await prisma.subCategory.findFirst({
    where,
    select: subCategorySelect,
  });

  if (!subCategory) {
    throw new AppError("Subcategory not found", 404);
  }

  return subCategory;
};

const mapSubCategoryUniqueConstraintError = (
  error: Prisma.PrismaClientKnownRequestError
): never => {
  const target = Array.isArray(error.meta?.target)
    ? error.meta.target.join(", ")
    : String(error.meta?.target ?? "");

  if (target.includes("slug")) {
    throw new AppError("A subcategory with this slug already exists", 409);
  }

  if (target.includes("categoryId") && target.includes("name")) {
    throw new AppError("A subcategory with this name already exists in this category", 409);
  }

  throw new AppError("A subcategory with the provided unique values already exists", 409);
};

const handleSubCategoryWriteError = (error: unknown): never => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    mapSubCategoryUniqueConstraintError(error);
  }

  throw error;
};

export const listSubCategories = async (query: ListSubCategoriesQuery = {}) => {
  const subCategories = await prisma.subCategory.findMany({
    where: {
      isActive: true,
      category: {
        isActive: true,
      },
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    },
    orderBy: [{ name: "asc" }],
    select: subCategorySelect,
  });

  return subCategories.map(serializeSubCategory);
};

export const getSubCategoryById = async (subCategoryId: number) => {
  const subCategory = await getSubCategoryOrThrow({
    id: subCategoryId,
    isActive: true,
    category: {
      isActive: true,
    },
  });

  return serializeSubCategory(subCategory);
};

export const getSubCategoryBySlug = async (slug: string) => {
  const subCategory = await getSubCategoryOrThrow({
    slug: trimRequired(slug),
    isActive: true,
    category: {
      isActive: true,
    },
  });

  return serializeSubCategory(subCategory);
};

export const listSubCategoriesByCategory = async (categoryId: number) => {
  await ensureActiveCategory(categoryId);
  return listSubCategories({ categoryId });
};

export const createSubCategory = async (input: CreateSubCategoryInput) => {
  await ensureActiveCategory(input.categoryId);

  const subCategorySlug = await buildUniqueSubCategorySlug(input.slug || input.name);

  try {
    const subCategory = await prisma.subCategory.create({
      data: {
        categoryId: input.categoryId,
        name: trimRequired(input.name),
        slug: subCategorySlug,
        description: trimNullable(input.description) ?? null,
        image: trimNullable(input.image) ?? null,
        isActive: input.isActive ?? true,
      },
      select: subCategorySelect,
    });

    return serializeSubCategory(subCategory);
  } catch (error) {
    handleSubCategoryWriteError(error);
  }
};

export const updateSubCategory = async (
  subCategoryId: number,
  input: UpdateSubCategoryInput
) => {
  const existingSubCategory = await prisma.subCategory.findUnique({
    where: { id: subCategoryId },
    select: {
      id: true,
      categoryId: true,
      name: true,
    },
  });

  if (!existingSubCategory) {
    throw new AppError("Subcategory not found", 404);
  }

  const nextCategoryId = input.categoryId ?? existingSubCategory.categoryId;
  await ensureActiveCategory(nextCategoryId);

  const nextSlug =
    input.slug !== undefined || input.name !== undefined
      ? await buildUniqueSubCategorySlug(
          input.slug || input.name || existingSubCategory.name,
          subCategoryId
        )
      : undefined;

  try {
    const subCategory = await prisma.$transaction(async (tx) => {
      const updatedSubCategory = await tx.subCategory.update({
        where: { id: subCategoryId },
        data: {
          categoryId: nextCategoryId,
          name: input.name !== undefined ? trimRequired(input.name) : undefined,
          slug: nextSlug,
          description:
            input.description !== undefined ? trimNullable(input.description) ?? null : undefined,
          image: input.image !== undefined ? trimNullable(input.image) ?? null : undefined,
          isActive: input.isActive,
        },
      });

      if (input.isActive === false) {
        await tx.product.updateMany({
          where: {
            subCategoryId,
          },
          data: {
            isActive: false,
          },
        });
      }

      return tx.subCategory.findUniqueOrThrow({
        where: { id: updatedSubCategory.id },
        select: subCategorySelect,
      });
    });

    return serializeSubCategory(subCategory);
  } catch (error) {
    handleSubCategoryWriteError(error);
  }
};

export const deleteSubCategory = async (subCategoryId: number): Promise<void> => {
  const existingSubCategory = await prisma.subCategory.findUnique({
    where: { id: subCategoryId },
    select: { id: true },
  });

  if (!existingSubCategory) {
    throw new AppError("Subcategory not found", 404);
  }

  await prisma.$transaction(async (tx) => {
    await Promise.all([
      tx.subCategory.update({
        where: { id: subCategoryId },
        data: { isActive: false },
      }),
      tx.product.updateMany({
        where: { subCategoryId },
        data: { isActive: false },
      }),
    ]);
  });
};
