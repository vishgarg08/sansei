import { Prisma } from "@prisma/client";

export const categorySelect = Prisma.validator<Prisma.CategorySelect>()({
  id: true,
  name: true,
  slug: true,
  description: true,
  image: true,
  isActive: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
  subcategories: {
    where: {
      isActive: true,
    },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      categoryId: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  },
  _count: {
    select: {
      products: true,
      subcategories: true,
    },
  },
});

export const subCategorySelect = Prisma.validator<Prisma.SubCategorySelect>()({
  id: true,
  categoryId: true,
  name: true,
  slug: true,
  description: true,
  image: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
    },
  },
  _count: {
    select: {
      products: true,
    },
  },
});

export type CategoryRecord = Prisma.CategoryGetPayload<{
  select: typeof categorySelect;
}>;

export type SubCategoryRecord = Prisma.SubCategoryGetPayload<{
  select: typeof subCategorySelect;
}>;
