import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { checkoutService } from "../services/checkout.service.js";

// Create checkout session (requires auth)
const createSession = async (req: AuthRequest, res: Response) => {
  const { items, shipping } = req.body;
  const result = await checkoutService.createCheckoutSession({
    items,
    shipping,
    userId: req.userId!,
  });
  res.json(result);
};

// Get checkout session
const getSession = async (req: Request, res: Response) => {
  const result = await checkoutService.getCheckoutSession(
    req.params.id as string,
  );
  res.json(result);
};

// Handle Stripe webhook
const handleWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    res.status(400).json({ error: "Missing stripe-signature header" });
    return;
  }

  const event = checkoutService.constructWebhookEvent(
    req.body, // Raw body buffer
    signature,
  );

  await checkoutService.handleWebhookEvent(event);

  res.json({ received: true });
};

export const checkoutController = {
  createSession,
  getSession,
  handleWebhook,
};
