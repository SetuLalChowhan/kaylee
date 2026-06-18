import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";

// ─── Password Helpers ──────────────────────────────────────────────────────────

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hashed: string): Promise<boolean> => {
  return bcrypt.compare(password, hashed);
};

// ─── Token Generators ──────────────────────────────────────────────────────────

/**
 * Short-lived access token — expires in 15 minutes.
 */
export const generateAccessToken = (payload: object): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error("ACCESS_TOKEN_SECRET is missing in .env");

  const options: SignOptions = { expiresIn: "15m" };
  return jwt.sign(payload, secret, options);
};

/**
 * Long-lived refresh token — expires in 7 days.
 */
export const generateRefreshToken = (payload: object): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error("REFRESH_TOKEN_SECRET is missing in .env");

  const options: SignOptions = { expiresIn: "7d" };
  return jwt.sign(payload, secret, options);
};

/**
 * Short-lived password-reset token — expires in 10 minutes.
 */
export const generateResetToken = (payload: object): string => {
  const secret = process.env.RESET_TOKEN_SECRET;
  if (!secret) throw new Error("RESET_TOKEN_SECRET is missing in .env");

  const options: SignOptions = { expiresIn: "10m" };
  return jwt.sign(payload, secret, options);
};