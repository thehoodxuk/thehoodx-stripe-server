import { categoryRepo } from "../repos/category.repo.js";
import {
  productRepo,
  type ProductQueryOptions,
} from "../repos/product.repo.js";
import { AppError } from "../lib/app-error.js";

// Get all categories
const listCategories = async () => {
  const categories = await categoryRepo.findAll();
  return { categories };
};

// Get category by ID or slug
const getByIdOrSlug = async (param: string) => {
  if (!param) {
    throw new AppError(400, "Category ID or slug is required");
  }

  const category = await categoryRepo.findByIdOrSlug(param);
  if (!category) {
    throw new AppError(404, "Category not found");
  }
  return { category };
};

// Get products by category
const getProductsByCategory = async (
  param: string,
  options: Omit<ProductQueryOptions, "categoryId" | "categorySlug">,
) => {
  if (!param) {
    throw new AppError(400, "Category ID or slug is required");
  }

  const category = await categoryRepo.findByIdOrSlug(param);
  if (!category) {
    throw new AppError(404, "Category not found");
  }

  const result = await productRepo.findMany({
    ...options,
    categoryId: category.id,
  });

  return { category, ...result };
};

export const categoryService = {
  listCategories,
  getByIdOrSlug,
  getProductsByCategory,
};
