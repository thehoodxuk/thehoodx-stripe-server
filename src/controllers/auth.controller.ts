import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { authService } from "../services/auth.service.js";

// Register new user
const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await authService.registerUser(name, email, password);
  res.status(201).json(result);
};

// Login user
const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  res.json(result);
};

// Get current user
const me = async (req: AuthRequest, res: Response) => {
  const result = await authService.getCurrentUser(req.userId!);
  res.json(result);
};

// Refresh access token
const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);
  res.json(result);
};

// Logout user
const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.deleteRefreshToken(refreshToken);
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
