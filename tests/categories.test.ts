import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/server.js";

describe("Category Routes", () => {
  describe("GET /api/categories", () => {
    it("should return all categories", async () => {
      const res = await request(app).get("/api/categories");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("categories");
      expect(Array.isArray(res.body.categories)).toBe(true);
    });
  });

  describe("GET /api/categories/:idOrSlug", () => {
    it("should return category by slug", async () => {
      // First get all categories to find a valid slug
      const categoriesRes = await request(app).get("/api/categories");

      if (categoriesRes.body.categories.length > 0) {
        const slug = categoriesRes.body.categories[0].slug;
        const res = await request(app).get(`/api/categories/${slug}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("category");
        expect(res.body.category.slug).toBe(slug);
      }
    });

    it("should return 404 for non-existent category", async () => {
      const res = await request(app).get("/api/categories/non-existent-slug");

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/categories/:idOrSlug/products", () => {
    it("should return products by category", async () => {
      // First get all categories to find a valid slug
      const categoriesRes = await request(app).get("/api/categories");

      if (categoriesRes.body.categories.length > 0) {
        const slug = categoriesRes.body.categories[0].slug;
        const res = await request(app).get(`/api/categories/${slug}/products`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("category");
        expect(res.body).toHaveProperty("products");
        expect(Array.isArray(res.body.products)).toBe(true);
      }
    });

    it("should return products with pagination", async () => {
      const categoriesRes = await request(app).get("/api/categories");

      if (categoriesRes.body.categories.length > 0) {
        const slug = categoriesRes.body.categories[0].slug;
        const res = await request(app).get(
          `/api/categories/${slug}/products?page=1&limit=5`,
        );

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("products");
        expect(res.body).toHaveProperty("page");
        expect(res.body).toHaveProperty("limit");
        expect(res.body).toHaveProperty("total");
        expect(res.body).toHaveProperty("totalPages");
      }
    });

    it("should return products with price filter", async () => {
      const categoriesRes = await request(app).get("/api/categories");

      if (categoriesRes.body.categories.length > 0) {
        const slug = categoriesRes.body.categories[0].slug;
        const res = await request(app).get(
          `/api/categories/${slug}/products?minPrice=10&maxPrice=100`,
        );

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("products");
      }
    });

    it("should return products sorted by price", async () => {
      const categoriesRes = await request(app).get("/api/categories");

      if (categoriesRes.body.categories.length > 0) {
        const slug = categoriesRes.body.categories[0].slug;
        const res = await request(app).get(
          `/api/categories/${slug}/products?sort=price-asc`,
        );

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("products");
      }
    });

    it("should return 404 for non-existent category", async () => {
      const res = await request(app).get(
        "/api/categories/non-existent-slug/products",
      );

      expect(res.status).toBe(404);
    });
  });
});
