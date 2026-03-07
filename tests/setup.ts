import "dotenv/config";
import { beforeAll, afterAll } from "vitest";

// Setup before all tests
beforeAll(async () => {
  console.log("🧪 Starting tests...");
});

// Cleanup after all tests
afterAll(async () => {
  console.log("✅ Tests completed");
});
