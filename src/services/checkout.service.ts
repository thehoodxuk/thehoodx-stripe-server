import Stripe from "stripe";
import { AppError } from "../lib/app-error.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

interface CheckoutItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Create checkout session
const createCheckoutSession = async (items: CheckoutItem[]) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError(400, "Cart items are required");
  }

  const lineItems = items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        ...(item.image && { images: [item.image] }),
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/checkout/failed`,
  });

  return { sessionId: session.id, url: session.url };
};

// Get checkout session by ID
const getCheckoutSession = async (sessionId: string) => {
  if (!sessionId) {
    throw new AppError(400, "Session ID is required");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    status: session.payment_status,
    customerEmail: session.customer_details?.email,
  };
};

export const checkoutService = {
  createCheckoutSession,
  getCheckoutSession,
};
