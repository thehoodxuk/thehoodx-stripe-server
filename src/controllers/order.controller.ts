import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { orderService } from "../services/order.service.js";
import type { OrderStatus } from "../generated/prisma/enums.js";

// Get user's orders
const getMyOrders = async (req: AuthRequest, res: Response) => {
  const { page, limit, status } = req.query;

  const result = await orderService.getUserOrders(req.userId!, {
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    status: status as OrderStatus | undefined,
  });

  res.json(result);
};

// Get single order
const getOrder = async (req: AuthRequest, res: Response) => {
  const result = await orderService.getOrderById(
    req.params.id as string,
    req.userId!,
    req.body?.isAdmin, // Will be set by admin middleware if exists
  );

  res.json(result);
};

// Get order by Stripe session ID (for success page)
const getOrderBySession = async (req: AuthRequest, res: Response) => {
  const result = await orderService.getOrderByStripeSession(
    req.params.sessionId as string,
  );

  // Verify ownership
  if (result.order.userId !== req.userId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  res.json(result);
};

// Admin: Get all orders
const getAllOrders = async (req: AuthRequest, res: Response) => {
  const { page, limit, status } = req.query;

  const result = await orderService.getAllOrders({
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    status: status as OrderStatus | undefined,
  });

  res.json(result);
};

// Admin: Update order status
const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { status } = req.body;

  const result = await orderService.updateOrderStatus(
    req.params.id as string,
    status as OrderStatus,
  );

  res.json(result);
};

export const orderController = {
  getMyOrders,
  getOrder,
  getOrderBySession,
  getAllOrders,
  updateOrderStatus,
};
