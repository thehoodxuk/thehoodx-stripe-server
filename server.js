require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 3000;

const app = express();

const allowedOrigins = [
  "https://thehoodx.vercel.app",
  "http://localhost:3000",
];
const corsOption = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // If you need to send cookies
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};
app.use(cors(corsOption));

app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    // In a real application, you would grant access to the product or update the database here.
    console.log(`Payment successful for session ID: ${session.id}`);
    console.log(`Customer email: ${session.customer_details?.email}`);
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }

  // Acknowledge receipt of the event
  res.status(200).send();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Middleware to parse JSON bodies for all routes defined AFTER this point
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  try {
    const items = req.body.items;

    const line_items = items.map(item => ({
      price_data: {
        currency: "cad",
        product_data: {
          name: item.name
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity || 1
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;