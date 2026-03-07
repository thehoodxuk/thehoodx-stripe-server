import { userRepo } from "../repos/user.repo.js";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from "../lib/auth.js";
import { AppError } from "../lib/app-error.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";

// Register a new user
const registerUser = async (name: string, email: string, password: string) => {
  if (!name || !email || !password) {
    throw new AppError(400, "Name, email, and password are required");
  }
  if (password.length < 8) {
    throw new AppError(400, "Password must be at least 8 characters");
  }

  const existing = await userRepo.findByEmail(email.toLowerCase().trim());
  if (existing) {
    throw new AppError(409, "Email already in use");
  }

  const hashed = await hashPassword(password);
  const newUser = await userRepo.create({
    name,
    email: email.toLowerCase().trim(),
    password: hashed,
  });

  const userWithoutPwd = sanitizeUser(newUser);

  const accessToken = generateAccessToken({
    userId: newUser.id,
    email: newUser.email,
  });

  const refreshToken = generateRefreshToken({
    userId: newUser.id,
    email: newUser.email,
  });

  // store refresh token in DB
  await userRepo.storeRefreshToken({
    userId: newUser.id,
    refreshToken,
  });

  return { user: userWithoutPwd, accessToken, refreshToken };
};

// Login user
const loginUser = async (email: string, password: string) => {
  if (!email || !password) {
    throw new AppError(400, "Email and password are required");
  }

  const user = await userRepo.findByEmail(email.toLowerCase().trim());
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  // revoke existing refresh tokens
  await userRepo.revokeRefreshToken(user.id);

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
  });

  // store new refresh token in DB
  await userRepo.storeRefreshToken({
    userId: user.id,
    refreshToken,
  });

  const userWithoutPwd = sanitizeUser(user);

  return { user: userWithoutPwd, accessToken, refreshToken };
};

// Check if email is already used
const isEmailAlreadyUsed = async (email: string) => {
  const emailExists = await userRepo.findByEmail(email.toLowerCase().trim());
  return !!emailExists;
};

// Refresh access token using refresh token
const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError(400, "Refresh token is required");
  }

  const tokenRecord = await userRepo.validateRefreshToken(refreshToken);
  if (!tokenRecord) {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  const user = await userRepo.findById(tokenRecord.userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  // revoke existing refresh tokens
  await userRepo.revokeRefreshToken(user.id);

  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const newRefreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
  });

  // store new refresh token in DB
  await userRepo.storeRefreshToken({
    userId: user.id,
    refreshToken: newRefreshToken,
  });

  const userWithoutPwd = sanitizeUser(user);

  return {
    user: userWithoutPwd,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// Get current user (session check)
const getCurrentUser = async (userId: string) => {
  if (!userId) {
    throw new AppError(400, "User ID is required");
  }

  const user = await userRepo.findById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const userWithoutPwd = sanitizeUser(user);
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  return { user: userWithoutPwd, accessToken };
};

// Delete refresh token (logout)
const deleteRefreshToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError(400, "Refresh token is required");
  }

  await userRepo.deleteRefreshToken(refreshToken);
  return { message: "Logged out successfully" };
};

// Change password
const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  if (!currentPassword || !newPassword) {
    throw new AppError(400, "Current and new password are required");
  }
  if (newPassword.length < 8) {
    throw new AppError(400, "New password must be at least 8 characters");
  }

  const user = await userRepo.findById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const valid = await comparePassword(currentPassword, user.password);
  if (!valid) {
    throw new AppError(401, "Current password is incorrect");
  }

  const hashed = await hashPassword(newPassword);
  await userRepo.update(user.id, { password: hashed });

  return { message: "Password changed successfully" };
};

export const authService = {
  registerUser,
  loginUser,
  isEmailAlreadyUsed,
  refreshAccessToken,
  getCurrentUser,
  deleteRefreshToken,
  changePassword,
};
