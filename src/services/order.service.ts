import { orderRepo, type CreateOrderData } from "../repos/order.repo.js";
import { productRepo } from "../repos/product.repo.js";
import { AppError } from "../lib/app-error.js";
import type { OrderStatus } from "@prisma/client";

export interface CartItem {
  productId: string;
  quantity: number;
  size: string;
  color: string;
}

export interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  postal: string;
  country: string;
}

// Create a new order from cart items
const createOrder = async (
  userId: string,
  cartItems: CartItem[],
  shipping: ShippingInfo,
  stripeSessionId?: string,
) => {
  if (!cartItems || cartItems.length === 0) {
    throw new AppError(400, "Cart items are required");
  }

  // Validate all products exist and calculate total
  const orderItems: CreateOrderData["items"] = [];
  let total = 0;

  for (const item of cartItems) {
    const product = await productRepo.findById(item.productId);
    if (!product) {
      throw new AppError(404, `Product not found: ${item.productId}`);
    }

    // Validate size
    if (!product.sizes.includes(item.size)) {
      throw new AppError(
        400,
        `Invalid size "${item.size}" for product ${product.name}`,
      );
    }

    // Validate color
    if (!product.colors.includes(item.color)) {
      throw new AppError(
        400,
        `Invalid color "${item.color}" for product ${product.name}`,
      );
    }

    // Check stock
    if (product.stock < item.quantity) {
      throw new AppError(400, `Insufficient stock for ${product.name}`);
    }

    const itemTotal = product.price * item.quantity;
    total += itemTotal;

    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price: product.price,
      size: item.size,
      color: item.color,
    });
  }

  const order = await orderRepo.create({
    userId,
    total,
    shippingName: shipping.name,
    shippingAddress: shipping.address,
    shippingCity: shipping.city,
    shippingPostal: shipping.postal,
    shippingCountry: shipping.country,
    stripeSessionId,
    items: orderItems,
  });

  return order;
};

// Get order by ID (with authorization check)
const getOrderById = async (
  orderId: string,
  userId: string,
  isAdmin = false,
) => {
  if (!orderId) {
    throw new AppError(400, "Order ID is required");
  }

  const order = await orderRepo.findById(orderId);
  if (!order) {
    throw new AppError(404, "Order not found");
  }

  // Only allow access if user owns the order or is admin
  if (!isAdmin && order.userId !== userId) {
    throw new AppError(403, "Access denied");
  }

  return { order };
};

// Get user's orders
const getUserOrders = async (
  userId: string,
  options: { page?: number; limit?: number; status?: OrderStatus } = {},
) => {
  const result = await orderRepo.findMany({
    userId,
    status: options.status,
    page: options.page,
    limit: options.limit,
  });

  return result;
};

// Get all orders (admin only)
const getAllOrders = async (
  options: { page?: number; limit?: number; status?: OrderStatus } = {},
) => {
  return orderRepo.findMany(options);
};

// Update order status
const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  if (!orderId) {
    throw new AppError(400, "Order ID is required");
  }

  const order = await orderRepo.findById(orderId);
  if (!order) {
    throw new AppError(404, "Order not found");
  }

  const updated = await orderRepo.updateStatus(orderId, status);
  return { order: updated };
};

// Mark order as paid (called from webhook)
const markOrderAsPaid = async (stripeSessionId: string) => {
  const order = await orderRepo.findByStripeSessionId(stripeSessionId);
  if (!order) {
    throw new AppError(404, "Order not found for session");
  }

  await orderRepo.updateStatus(order.id, "PROCESSING");
  return order;
};

// Get order by Stripe session ID
const getOrderByStripeSession = async (sessionId: string) => {
  const order = await orderRepo.findByStripeSessionId(sessionId);
  if (!order) {
    throw new AppError(404, "Order not found");
  }
  return { order };
};

export const orderService = {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  markOrderAsPaid,
  getOrderByStripeSession,
};
