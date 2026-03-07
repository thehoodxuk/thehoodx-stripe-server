import {
  productRepo,
  type ProductQueryOptions,
} from "../repos/product.repo.js";
import { AppError } from "../lib/app-error.js";

// List products with filters
const listProducts = async (options: ProductQueryOptions) => {
  const result = await productRepo.findMany(options);
  return result;
};

// Get product by ID
const getProductById = async (id: string) => {
  if (!id) {
    throw new AppError(400, "Product ID is required");
  }

  const product = await productRepo.findById(id);
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  const related = await productRepo.findRelated(product.id, product.categoryId);
  return { product, related };
};

// Get featured products
const getFeaturedProducts = async (limit?: number) => {
  const products = await productRepo.findFeatured(limit);
  return { products };
};

// Get available filters
const getAvailableFilters = async () => {
  return productRepo.getAvailableFilters();
};

export const productService = {
  listProducts,
  getProductById,
  getFeaturedProducts,
  getAvailableFilters,
};
