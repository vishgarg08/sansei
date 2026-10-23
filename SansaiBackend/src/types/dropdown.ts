export type CategoryDropdownItem = {
  id: number;
  name: string;
  slug: string;
};

export type SubCategoryDropdownItem = {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
};

export type DistinctValueItem = {
  value: string;
  count: number;
};

export type SizesColorsResult = {
  sizes: DistinctValueItem[];
  colors: DistinctValueItem[];
};

export type ProductFormData = {
  categories: CategoryDropdownItem[];
  subcategories: SubCategoryDropdownItem[];
  sizes: DistinctValueItem[];
  colors: DistinctValueItem[];
};
