import type { Request, Response } from "express";
import { productService } from "../services/product.service.js";

// List products with filters
const list = async (req: Request, res: Response) => {
  const {
    category,
    minPrice,
    maxPrice,
    sizes,
    colors,
    featured,
    inStock,
    search,
    sort,
    page,
    limit,
  } = req.query;

  const result = await productService.listProducts({
    categorySlug: category as string | undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sizes: sizes ? (sizes as string).split(",") : undefined,
    colors: colors ? (colors as string).split(",") : undefined,
    featured: featured !== undefined ? featured === "true" : undefined,
    inStock: inStock === "true",
    search: search as string | undefined,
    sort: sort as
      | "price-asc"
      | "price-desc"
      | "name-asc"
      | "name-desc"
      | "newest"
      | undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  res.json(result);
};

// Get product by ID
const getById = async (req: Request, res: Response) => {
  const result = await productService.getProductById(req.params.id as string);
  res.json(result);
};

// Get featured products
const featured = async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const result = await productService.getFeaturedProducts(limit);
  res.json(result);
};

// Get available filters
const filters = async (_req: Request, res: Response) => {
  const result = await productService.getAvailableFilters();
  res.json(result);
};

export const productController = {
  list,
  getById,
  featured,
  filters,
};
