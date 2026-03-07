import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/server.js";

describe("Order Routes", () => {
  let accessToken: string;

  beforeAll(async () => {
    // Create unique test user for entire suite
    const timestamp = Date.now();
    const email = `order_test_${timestamp}@test.com`;

    const signupRes = await request(app)
      .post("/api/auth/signup")
      .send({ email, password: "testpass123", name: "Order Test" });

    accessToken = signupRes.body.accessToken;
  });

  describe("GET /api/orders", () => {
    it("should require authentication", async () => {
      const res = await request(app).get("/api/orders");

      expect(res.status).toBe(401);
    });

    it("should return empty orders for new user", async () => {
      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.orders).toEqual([]);
      expect(res.body.total).toBe(0);
    });
  });

  describe("GET /api/orders/:id", () => {
    it("should require authentication", async () => {
      const res = await request(app).get("/api/orders/some-order-id");

      expect(res.status).toBe(401);
    });

    it("should return 404 for non-existent order", async () => {
      const res = await request(app)
        .get("/api/orders/non-existent-id")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/orders/session/:sessionId", () => {
    it("should require authentication", async () => {
      const res = await request(app).get("/api/orders/session/cs_test_123");

      expect(res.status).toBe(401);
    });

    it("should return 404 for non-existent session", async () => {
      const res = await request(app)
        .get("/api/orders/session/non-existent-session")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/orders/:id/status", () => {
    it("should require authentication", async () => {
      const res = await request(app)
        .patch("/api/orders/some-id/status")
        .send({ status: "SHIPPED" });

      expect(res.status).toBe(401);
    });

    it("should return 404 for non-existent order", async () => {
      const res = await request(app)
        .patch("/api/orders/non-existent-id/status")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ status: "SHIPPED" });

      expect(res.status).toBe(404);
    });
  });
});
