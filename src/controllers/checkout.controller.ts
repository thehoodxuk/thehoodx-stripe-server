import type { Request, Response } from "express";
import { checkoutService } from "../services/checkout.service.js";

// Create checkout session
const createSession = async (req: Request, res: Response) => {
  const { items } = req.body;
  const result = await checkoutService.createCheckoutSession(items);
  res.json(result);
};

// Get checkout session
const getSession = async (req: Request, res: Response) => {
  const result = await checkoutService.getCheckoutSession(
    req.params.id as string,
  );
  res.json(result);
};

export const checkoutController = {
  createSession,
  getSession,
};
