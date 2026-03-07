import Stripe from "stripe";
import { AppError } from "../lib/app-error.js";
import { productRepo } from "../repos/product.repo.js";
import { orderRepo } from "../repos/order.repo.js";
import type { CartItem, ShippingInfo } from "./order.service.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export interface CheckoutData {
  items: CartItem[];
  shipping: ShippingInfo;
  userId: string;
}

// Create checkout session with order
const createCheckoutSession = async (data: CheckoutData) => {
  const { items, shipping, userId } = data;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError(400, "Cart items are required");
  }

  if (
    !shipping ||
    !shipping.name ||
    !shipping.address ||
    !shipping.city ||
    !shipping.postal ||
    !shipping.country
  ) {
    throw new AppError(400, "Complete shipping information is required");
  }

  // Validate products and build line items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let total = 0;

  for (const item of items) {
    const product = await productRepo.findById(item.productId);
    if (!product) {
      throw new AppError(404, `Product not found: ${item.productId}`);
    }

    // Validate size and color
    if (!product.sizes.includes(item.size)) {
      throw new AppError(
        400,
        `Invalid size "${item.size}" for product ${product.name}`,
      );
    }
    if (!product.colors.includes(item.color)) {
      throw new AppError(
        400,
        `Invalid color "${item.color}" for product ${product.name}`,
      );
    }
    if (product.stock < item.quantity) {
      throw new AppError(400, `Insufficient stock for ${product.name}`);
    }

    total += product.price * item.quantity;

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          description: `Size: ${item.size}, Color: ${item.color}`,
          images: product.image ? [product.image] : [],
          metadata: {
            productId: product.id,
            size: item.size,
            color: item.color,
          },
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: item.quantity,
    });
  }

  // Build order items with prices from validated products
  const orderItems: {
    productId: string;
    quantity: number;
    price: number;
    size: string;
    color: string;
  }[] = [];

  for (const item of items) {
    const product = await productRepo.findById(item.productId);
    if (product) {
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        color: item.color,
      });
    }
  }

  // Create order first (status: PENDING)
  const order = await orderRepo.create({
    userId,
    total,
    shippingName: shipping.name,
    shippingAddress: shipping.address,
    shippingCity: shipping.city,
    shippingPostal: shipping.postal,
    shippingCountry: shipping.country,
    items: orderItems,
  });

  // Create Stripe session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
    customer_email: undefined, // Will be captured during checkout
    metadata: {
      orderId: order.id,
      userId,
    },
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR"],
    },
  });

  // Update order with Stripe session ID
  await orderRepo.updateStripeSessionId(order.id, session.id);

  return {
    sessionId: session.id,
    url: session.url,
    orderId: order.id,
  };
};

// Get checkout session by ID
const getCheckoutSession = async (sessionId: string) => {
  if (!sessionId) {
    throw new AppError(400, "Session ID is required");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  // Get order if exists
  const order = session.metadata?.orderId
    ? await orderRepo.findById(session.metadata.orderId)
    : null;

  return {
    status: session.payment_status,
    customerEmail: session.customer_details?.email,
    orderId: session.metadata?.orderId,
    order,
  };
};

// Handle Stripe webhook events
const handleWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status === "paid" && session.metadata?.orderId) {
        // Update order to PROCESSING
        await orderRepo.updateStatus(session.metadata.orderId, "PROCESSING");

        // TODO: Reduce product stock
        // TODO: Send confirmation email

        console.log(`Order ${session.metadata.orderId} marked as PROCESSING`);
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.orderId) {
        // Cancel the order
        await orderRepo.updateStatus(session.metadata.orderId, "CANCELLED");
        console.log(
          `Order ${session.metadata.orderId} cancelled due to session expiry`,
        );
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment failed: ${paymentIntent.id}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

// Verify and construct webhook event
const constructWebhookEvent = (payload: Buffer, signature: string) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new AppError(500, "Webhook secret not configured");
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    throw new AppError(400, "Invalid webhook signature");
  }
};

export const checkoutService = {
  createCheckoutSession,
  getCheckoutSession,
  handleWebhookEvent,
  constructWebhookEvent,
};
