import prisma from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";

const findById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });

  return user;
};

const findByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  return user;
};

const create = async (data: Prisma.UserCreateInput) => {
  const user = await prisma.user.create({ data });

  return user;
};

const update = async (id: string, data: Prisma.UserUpdateInput) => {
  const user = await prisma.user.update({ where: { id }, data });

  return user;
};

// Refresh Token methods
const storeRefreshToken = async (data: {
  userId: string;
  refreshToken: string;
}) => {
  const token = await prisma.refreshToken.create({
    data: {
      refreshToken: data.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      user: { connect: { id: data.userId } },
    },
  });

  return token;
};

const validateRefreshToken = async (refreshToken: string) => {
  const token = await prisma.refreshToken.findFirst({
    where: {
      refreshToken,
      expiresAt: { gt: new Date() },
    },
  });

  return token;
};

const revokeRefreshToken = async (userId: string) => {
  const result = await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  return result;
};

const deleteRefreshToken = async (refreshToken: string) => {
  const result = await prisma.resetToken.deleteMany({
    where: { refreshToken },
  });

  return result;
};

export const userRepo = {
  findById,
  findByEmail,
  create,
  update,
  storeRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  deleteRefreshToken,
};
