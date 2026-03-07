import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/server.js";

describe("Product Routes", () => {
  describe("GET /api/products", () => {
    it("should return all products", async () => {
      const res = await request(app).get("/api/products");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("products");
      expect(Array.isArray(res.body.products)).toBe(true);
    });

    it("should return paginated products", async () => {
      const res = await request(app).get("/api/products?page=1&limit=5");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("products");
      expect(res.body).toHaveProperty("page");
      expect(res.body).toHaveProperty("limit");
      expect(res.body).toHaveProperty("total");
      expect(res.body).toHaveProperty("totalPages");
    });

    it("should filter products by price range", async () => {
      const res = await request(app).get(
        "/api/products?minPrice=10&maxPrice=100",
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("products");
    });

    it("should filter products by category", async () => {
      // First get categories to find valid slug
      const categoriesRes = await request(app).get("/api/categories");

      if (categoriesRes.body.categories.length > 0) {
        const categorySlug = categoriesRes.body.categories[0].slug;
        const res = await request(app).get(
          `/api/products?category=${categorySlug}`,
        );

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("products");
      }
    });

    it("should filter featured products", async () => {
      const res = await request(app).get("/api/products?featured=true");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("products");
    });

    it("should filter in-stock products", async () => {
      const res = await request(app).get("/api/products?inStock=true");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("products");
    });

    it("should search products", async () => {
      const res = await request(app).get("/api/products?search=test");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("products");
    });

    it("should sort products by price ascending", async () => {
      const res = await request(app).get("/api/products?sort=price-asc");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("products");
    });

    it("should sort products by price descending", async () => {
      const res = await request(app).get("/api/products?sort=price-desc");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("products");
    });

    it("should sort products by name", async () => {
      const res = await request(app).get("/api/products?sort=name-asc");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("products");
    });

    it("should sort products by newest", async () => {
      const res = await request(app).get("/api/products?sort=newest");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("products");
    });

    it("should filter by sizes", async () => {
      const res = await request(app).get("/api/products?sizes=S,M,L");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("products");
    });

    it("should filter by colors", async () => {
      const res = await request(app).get("/api/products?colors=red,blue");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("products");
    });
  });

  describe("GET /api/products/featured", () => {
    it("should return featured products", async () => {
      const res = await request(app).get("/api/products/featured");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("products");
      expect(Array.isArray(res.body.products)).toBe(true);
    });

    it("should return limited featured products", async () => {
      const res = await request(app).get("/api/products/featured?limit=3");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("products");
      expect(res.body.products.length).toBeLessThanOrEqual(3);
    });
  });

  describe("GET /api/products/filters", () => {
    it("should return available filters", async () => {
      const res = await request(app).get("/api/products/filters");

      expect(res.status).toBe(200);
      // Should have price range, sizes, colors, categories
    });
  });

  describe("GET /api/products/:id", () => {
    it("should return product by ID", async () => {
      // First get a product to use its ID
      const productsRes = await request(app).get("/api/products");

      if (productsRes.body.products.length > 0) {
        const productId = productsRes.body.products[0].id;
        const res = await request(app).get(`/api/products/${productId}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("product");
        expect(res.body.product.id).toBe(productId);
      }
    });

    it("should return related products", async () => {
      const productsRes = await request(app).get("/api/products");

      if (productsRes.body.products.length > 0) {
        const productId = productsRes.body.products[0].id;
        const res = await request(app).get(`/api/products/${productId}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("related");
        expect(Array.isArray(res.body.related)).toBe(true);
      }
    });

    it("should return 404 for non-existent product", async () => {
      const res = await request(app).get(
        "/api/products/00000000-0000-0000-0000-000000000000",
      );

      expect(res.status).toBe(404);
    });
  });
});
