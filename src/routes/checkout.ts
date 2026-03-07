import { Router, raw } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { checkoutController } from "../controllers/checkout.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const checkoutRouter = Router();

// Create checkout session (requires auth)
checkoutRouter.post(
  "/create-session",
  requireAuth,
  asyncHandler(checkoutController.createSession),
);

// Get checkout session status
checkoutRouter.get("/session/:id", asyncHandler(checkoutController.getSession));

// Stripe webhook (needs raw body, no auth)
checkoutRouter.post(
  "/webhook",
  raw({ type: "application/json" }),
  asyncHandler(checkoutController.handleWebhook),
);
