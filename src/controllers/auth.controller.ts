import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { authService } from "../services/auth.service.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: "/",
};

// Register new user
const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const { refreshToken, ...result } = await authService.registerUser(
    name,
    email,
    password,
  );

  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
  res.status(201).json(result);
};

// Login user
const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { refreshToken, ...result } = await authService.loginUser(
    email,
    password,
  );

  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
  res.json(result);
};

// Get current user
const me = async (req: AuthRequest, res: Response) => {
  const result = await authService.getCurrentUser(req.userId!);
  res.json(result);
};

// Refresh access token
const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  const { refreshToken: newRefreshToken, ...result } =
    await authService.refreshAccessToken(refreshToken);

  res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
  res.json(result);
};

// Logout user
const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  const result = await authService.deleteRefreshToken(refreshToken);

  res.clearCookie("refreshToken", { path: "/" });
  res.json(result);
};

// Change password
const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(
    req.userId!,
    currentPassword,
    newPassword,
  );
  res.json(result);
};

export const authController = {
  signup,
  login,
  me,
  refresh,
  logout,
  changePassword,
};
