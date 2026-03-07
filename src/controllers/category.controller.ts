import type { Request, Response } from "express";
import { categoryService } from "../services/category.service.js";

// List all categories
const list = async (_req: Request, res: Response) => {
  const result = await categoryService.listCategories();
  res.json(result);
};

// Get category by ID or slug
const getByIdOrSlug = async (req: Request, res: Response) => {
  const result = await categoryService.getByIdOrSlug(
    req.params.idOrSlug as string,
  );
  res.json(result);
};

// Get products by category
const getProducts = async (req: Request, res: Response) => {
  const {
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

  const result = await categoryService.getProductsByCategory(
    req.params.idOrSlug as string,
    {
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
    },
  );

  res.json(result);
};

export const categoryController = {
  list,
  getByIdOrSlug,
  getProducts,
};
