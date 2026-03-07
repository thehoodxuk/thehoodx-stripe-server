import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export interface TokenPayload {
  userId: string;
  email: string;
}

// Read secrets lazily to support test environment setup
const getJwtSecret = () => process.env.JWT_SECRET!;
const getJwtRefreshSecret = () => process.env.JWT_REFRESH_SECRET!;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtRefreshSecret(), { expiresIn: "30d" });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, getJwtRefreshSecret()) as TokenPayload;
}
