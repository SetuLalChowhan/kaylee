import bcrypt from "bcryptjs";
import jwt, {} from "jsonwebtoken";
// ─── Password Helpers ──────────────────────────────────────────────────────────
export const hashPassword = async (password) => {
    return bcrypt.hash(password, 12);
};
export const comparePassword = async (password, hashed) => {
    return bcrypt.compare(password, hashed);
};
// ─── Token Generators ──────────────────────────────────────────────────────────
/**
 * Short-lived access token — expires in 15 minutes.
 */
export const generateAccessToken = (payload) => {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret)
        throw new Error("ACCESS_TOKEN_SECRET is missing in .env");
    const options = { expiresIn: "15m" };
    return jwt.sign(payload, secret, options);
};
/**
 * Long-lived refresh token — expires in 7 days.
 */
export const generateRefreshToken = (payload) => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret)
        throw new Error("REFRESH_TOKEN_SECRET is missing in .env");
    const options = { expiresIn: "7d" };
    return jwt.sign(payload, secret, options);
};
/**
 * Short-lived password-reset token — expires in 10 minutes.
 */
export const generateResetToken = (payload) => {
    const secret = process.env.RESET_TOKEN_SECRET;
    if (!secret)
        throw new Error("RESET_TOKEN_SECRET is missing in .env");
    const options = { expiresIn: "10m" };
    return jwt.sign(payload, secret, options);
};
//# sourceMappingURL=auth.util.js.map