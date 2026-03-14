require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

// Use the STRIPE_SECRET_KEY from environment variables instead of hardcoding
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
}));

// The Webhook endpoint must be defined BEFORE app.use(express.json())
// because it requires the raw body to verify the Stripe signature.
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
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;