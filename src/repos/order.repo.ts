import prisma from "../lib/prisma.js";
import type { OrderStatus } from "../generated/prisma/enums.js";

export interface CreateOrderData {
  userId: string;
  total: number;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostal: string;
  shippingCountry: string;
  stripeSessionId?: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    size: string;
    color: string;
  }[];
}

export interface OrderQueryOptions {
  userId?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

// Create a new order with items
const create = async (data: CreateOrderData) => {
  const order = await prisma.order.create({
    data: {
      userId: data.userId,
      total: data.total,
      shippingName: data.shippingName,
      shippingAddress: data.shippingAddress,
      shippingCity: data.shippingCity,
      shippingPostal: data.shippingPostal,
      shippingCountry: data.shippingCountry,
      stripeSessionId: data.stripeSessionId,
      items: {
        create: data.items,
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return order;
};

// Find order by ID
const findById = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

// Find order by Stripe session ID
const findByStripeSessionId = async (sessionId: string) => {
  return prisma.order.findFirst({
    where: { stripeSessionId: sessionId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
};

// Find many orders with filtering and pagination
const findMany = async (options: OrderQueryOptions = {}) => {
  const { userId, status, page = 1, limit = 10 } = options;

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// Update order status
const updateStatus = async (id: string, status: OrderStatus) => {
  return prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
};

// Update order with stripe session ID
const updateStripeSessionId = async (id: string, stripeSessionId: string) => {
  return prisma.order.update({
    where: { id },
    data: { stripeSessionId },
  });
};

// Update order by Stripe session ID
const updateByStripeSessionId = async (
  sessionId: string,
  data: { status?: OrderStatus },
) => {
  return prisma.order.updateMany({
    where: { stripeSessionId: sessionId },
    data,
  });
};

export const orderRepo = {
  create,
  findById,
  findByStripeSessionId,
  findMany,
  updateStatus,
  updateStripeSessionId,
  updateByStripeSessionId,
};
