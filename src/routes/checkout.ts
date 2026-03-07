import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { checkoutController } from "../controllers/checkout.controller.js";

export const checkoutRouter = Router();

checkoutRouter.post(
  "/create-session",
  asyncHandler(checkoutController.createSession),
);
checkoutRouter.get("/session/:id", asyncHandler(checkoutController.getSession));
