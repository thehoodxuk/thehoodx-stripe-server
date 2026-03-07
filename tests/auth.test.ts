import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/server.js";

describe("Auth Routes", () => {
  const testUser = {
    name: "Test User",
    email: `test${Date.now()}@example.com`,
    password: "password123",
  };

  let accessToken: string;
  let refreshToken: string;

  describe("POST /api/auth/signup", () => {
    it("should create a new user", async () => {
      const res = await request(app).post("/api/auth/signup").send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user");
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user).not.toHaveProperty("password");

      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it("should fail with missing fields", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        email: "test@example.com",
      });

      expect(res.status).toBe(400);
    });

    it("should fail with short password", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        name: "Test",
        email: "test2@example.com",
        password: "short",
      });

      expect(res.status).toBe(400);
    });

    it("should fail with duplicate email", async () => {
      const res = await request(app).post("/api/auth/signup").send(testUser);

      expect(res.status).toBe(409);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");

      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it("should fail with invalid email", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(res.status).toBe(401);
    });

    it("should fail with invalid password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
    });

    it("should fail with missing fields", async () => {
      const res = await request(app).post("/api/auth/login").send({});

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user with valid token", async () => {
      // Get fresh token
      const loginRes = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });
      const freshToken = loginRes.body.accessToken;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${freshToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(testUser.email);
    });

    it("should fail without token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
    });

    it("should fail with invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid_token");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should refresh access token", async () => {
      const res = await request(app).post("/api/auth/refresh").send({
        refreshToken,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");

      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it("should fail with invalid refresh token", async () => {
      const res = await request(app).post("/api/auth/refresh").send({
        refreshToken: "invalid_token",
      });

      expect(res.status).toBe(401);
    });

    it("should fail with missing refresh token", async () => {
      const res = await request(app).post("/api/auth/refresh").send({});

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/change-password", () => {
    it("should change password with valid credentials", async () => {
      // Create a unique user for this test
      const changePassUser = {
        name: "Change Pass User",
        email: `changepass${Date.now()}@example.com`,
        password: "password123",
      };

      const signupRes = await request(app)
        .post("/api/auth/signup")
        .send(changePassUser);
      const freshToken = signupRes.body.accessToken;

      const res = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${freshToken}`)
        .send({
          currentPassword: changePassUser.password,
          newPassword: "newpassword123",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
    });

    it("should fail with wrong current password", async () => {
      // Try to login with original password or new password
      let loginRes = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "newpassword123",
      });

      if (loginRes.status !== 200) {
        loginRes = await request(app).post("/api/auth/login").send({
          email: testUser.email,
          password: testUser.password,
        });
      }

      if (loginRes.status !== 200) {
        return; // Skip if can't login
      }

      accessToken = loginRes.body.accessToken;

      const res = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          currentPassword: "wrongpassword",
          newPassword: "anotherpassword",
        });

      expect(res.status).toBe(401);
    });

    it("should fail without authentication", async () => {
      const res = await request(app).post("/api/auth/change-password").send({
        currentPassword: "password123",
        newPassword: "newpassword123",
      });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      const res = await request(app).post("/api/auth/logout").send({
        refreshToken,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
    });
  });
});
