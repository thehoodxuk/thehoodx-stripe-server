import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/server.js";

let accessToken: string;

async function setupAuth() {
  const timestamp = Date.now();
  const email = `checkout_test_${timestamp}@test.com`;

  const signupRes = await request(app)
    .post("/api/auth/signup")
    .send({ email, password: "testpass123", name: "Checkout Test" });

  return signupRes.body.accessToken;
}

describe("Checkout Routes", () => {
  beforeAll(async () => {
    accessToken = await setupAuth();
  });

  describe("POST /api/checkout/create-session", () => {
    it("should require authentication", async () => {
      const res = await request(app)
        .post("/api/checkout/create-session")
        .send({
          items: [
            { productId: "test-id", quantity: 1, size: "M", color: "black" },
          ],
          shipping: {
            address: "123 Test St",
            city: "Test City",
            country: "US",
            postalCode: "12345",
          },
        });

      expect(res.status).toBe(401);
    });

    it("should reject invalid items", async () => {
      const res = await request(app)
        .post("/api/checkout/create-session")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          items: [],
          shipping: {
            address: "123 Test St",
            city: "Test City",
            country: "US",
            postalCode: "12345",
          },
        });

      expect(res.status).toBe(400);
    });

    it("should reject missing shipping info", async () => {
      const res = await request(app)
        .post("/api/checkout/create-session")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          items: [
            { productId: "test-id", quantity: 1, size: "M", color: "black" },
          ],
        });

      expect(res.status).toBe(400);
    });
  });
});
