const request = require("supertest");
const Stripe = require("stripe");

// 1. Create a shared mock instance
const mockStripeInstance = {
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({ url: "https://stripe.com/mock-checkout-url" })
    }
  },
  webhooks: {
    constructEvent: jest.fn()
  }
};

// 2. Mock the module to ALWAYS return this shared instance
jest.mock("stripe", () => {
  return jest.fn(() => mockStripeInstance);
});

// 3. Set required environment variables so the server loads successfully
process.env.STRIPE_SECRET_KEY = "sk_test_123";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_123";
process.env.FRONTEND_URL = "http://localhost:3000";

// Require app POST MOCK so it uses the mock!
const app = require("../server");

describe("Stripe Checkout Server", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset defaults for our shared mock instance
    mockStripeInstance.checkout.sessions.create.mockResolvedValue({ url: "https://stripe.com/mock-checkout-url" });
    mockStripeInstance.webhooks.constructEvent.mockReturnValue({ type: "unknown" });
  });

  describe("POST /create-checkout-session", () => {
    it("should create a checkout session and return a URL", async () => {
      const payload = {
        items: [
          { name: "Test Subscription", price: 20, quantity: 1 }
        ]
      };

      const response = await request(app)
        .post("/create-checkout-session")
        .send(payload)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("url", "https://stripe.com/mock-checkout-url");
      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledTimes(1);
    });

    it("should fail gracefully if payment session creation fails", async () => {
      mockStripeInstance.checkout.sessions.create.mockRejectedValueOnce(new Error("Stripe API down"));

      const payload = {
        items: [{ name: "Test Item", price: 10 }]
      };

      const response = await request(app)
        .post("/create-checkout-session")
        .send(payload)
        .expect("Content-Type", /json/)
        .expect(500);

      expect(response.body).toHaveProperty("error", "Internal Server Error");
    });
  });

  describe("POST /webhook", () => {
    it("should return 400 if signature is invalid", async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementationOnce(() => {
        throw new Error("Invalid signature");
      });

      const response = await request(app)
        .post("/webhook")
        .set("stripe-signature", "invalid-sig")
        .send({ id: "evt_test" })
        .expect(400);

      expect(response.text).toContain("Webhook Error: Invalid signature");
    });

    it("should return 200 and process checkout.session.completed", async () => {
      mockStripeInstance.webhooks.constructEvent.mockReturnValueOnce({
        type: "checkout.session.completed",
        data: {
          object: { id: "cs_test_123", customer_details: { email: "test@example.com" } }
        }
      });

      await request(app)
        .post("/webhook")
        .set("stripe-signature", "valid-sig")
        .send(Buffer.from(JSON.stringify({ id: "evt_test" })))
        .expect(200);
    });

    it("should return 200 for unhandled events", async () => {
       mockStripeInstance.webhooks.constructEvent.mockReturnValueOnce({
        type: "payment_intent.succeeded",
        data: {
          object: { id: "pi_test_123" }
        }
      });

      await request(app)
        .post("/webhook")
        .set("stripe-signature", "valid-sig")
        .send(Buffer.from(JSON.stringify({ id: "evt_test" })))
        .expect(200);
    });
  });
});
