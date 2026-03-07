import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/server.js";

describe("Health Check", () => {
  describe("GET /api/health", () => {
    it("should return health status", async () => {
      const res = await request(app).get("/api/health");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok" });
    });
  });
});
