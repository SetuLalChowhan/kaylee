/**
 * API Endpoints Catalog
 * All backend API routes in one place for consistency.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const AUTH = {
  REGISTER: `${API_BASE}/auth/register`,
  VERIFY_EMAIL: `${API_BASE}/auth/verify-email`,
  LOGIN: `${API_BASE}/auth/login`,
  GOOGLE_LOGIN: `${API_BASE}/auth/google-login`,
  FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
  VERIFY_RESET_OTP: `${API_BASE}/auth/verify-reset-otp`,
  RESEND_OTP: `${API_BASE}/auth/resend-otp`,
  RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  REFRESH_TOKEN: `${API_BASE}/auth/refresh-token`,
  LOGOUT: `${API_BASE}/auth/logout`,
};

export const USER = {
  GET_ME: `${API_BASE}/user/me`,
  DASHBOARD_STATS: `${API_BASE}/user/dashboard-stats`,
  UPDATE: `${API_BASE}/user/update`,
  CHANGE_PASSWORD: `${API_BASE}/user/change-password`,
  ONBOARDING: `${API_BASE}/user/onboarding`,
  DELETE_BRAND_LOGO: `${API_BASE}/user/brand-logo`,
  PORTFOLIO: `${API_BASE}/user/portfolio`,
  PORTFOLIO_PREVIEW: `${API_BASE}/user/portfolio-preview`,
  INVOICE: `${API_BASE}/invoice`,
  CAMPAIGN: `${API_BASE}/campaign`,
  PLANNER: `${API_BASE}/planner`,
  UGC_CAMPAIGN: `${API_BASE}/ugc-campaigns`,
};

export default { AUTH, USER };
