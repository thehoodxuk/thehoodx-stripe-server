import prisma from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";

export interface ProductQueryOptions {
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  featured?: boolean;
  inStock?: boolean;
  search?: string;
  sort?: "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest";
  page?: number;
  limit?: number;
}

const findMany = async (options: ProductQueryOptions) => {
  const where: Prisma.ProductWhereInput = {};

  if (options.categoryId) {
    where.categoryId = options.categoryId;
  }
  if (options.categorySlug) {
    where.category = { slug: options.categorySlug };
  }
  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    where.price = {};
    if (options.minPrice !== undefined) where.price.gte = options.minPrice;
    if (options.maxPrice !== undefined) where.price.lte = options.maxPrice;
  }
  if (options.sizes && options.sizes.length > 0) {
    where.sizes = { hasSome: options.sizes };
  }
  if (options.colors && options.colors.length > 0) {
    where.colors = { hasSome: options.colors };
  }
  if (options.featured !== undefined) {
    where.featured = options.featured;
  }
  if (options.inStock) {
    where.stock = { gt: 0 };
  }
  if (options.search) {
    where.OR = [
      { name: { contains: options.search, mode: "insensitive" } },
      { description: { contains: options.search, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  switch (options.sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "name-asc":
      orderBy = { name: "asc" };
      break;
    case "name-desc":
      orderBy = { name: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
  }

  const page = options.page ?? 1;
  const limit = Math.min(options.limit ?? 20, 100);
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const findById = async (id: string) => {
  const productById = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  return productById;
};

const findFeatured = async (limit = 6) => {
  const featuredProducts = await prisma.product.findMany({
    where: { featured: true },
    take: limit,
    include: { category: true },
  });

  return featuredProducts;
};

const findRelated = async (
  productId: string,
  categoryId: string,
  limit = 4,
) => {
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
    },
    take: limit,
    include: { category: true },
  });

  return relatedProducts;
};

const getAvailableFilters = async () => {
  const [sizes, colors, priceAgg, categories] = await Promise.all([
    prisma.product.findMany({ select: { sizes: true } }),
    prisma.product.findMany({ select: { colors: true } }),
    prisma.product.aggregate({
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.category.findMany(),
  ]);

  const allSizes = [...new Set(sizes.flatMap((p) => p.sizes))].sort();
  const allColors = [...new Set(colors.flatMap((p) => p.colors))].sort();

  const filters = {
    sizes: allSizes,
    colors: allColors,
    priceRange: {
      min: priceAgg._min.price ?? 0,
      max: priceAgg._max.price ?? 0,
    },
    categories,
  };

  return filters;
};

export const productRepo = {
  findMany,
  findById,
  findFeatured,
  findRelated,
  getAvailableFilters,
};
