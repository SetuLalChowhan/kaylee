import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

// Layouts and Guards (Keep eager for immediate routing structure)
import AdminLayout from "@/layout/AdminLayout";
import Layout from "@/layout/Layout";
import AuthLayout from "@/layout/AuthLayout";
import Home from "@/pages/sites/Home";
import PrivateRoute from "@/components/auth/PrivateRoute";

// Helper wrapper for Suspense fallback
const withSuspense = (Component) => (
  <Suspense fallback={
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-Primary"></div>
    </div>
  }>
    <Component />
  </Suspense>
);

// Lazy Loaded Pages & Components
const AcceptableUsePolicy = lazy(() => import("@/pages/sites/AcceptableUsePolicy"));
const CookiePolicy = lazy(() => import("@/pages/sites/CookiePolicy"));
const PrivacyPolicy = lazy(() => import("@/pages/sites/PrivacyPolicy"));
const SubscriptionBillingPolicy = lazy(() => import("@/pages/sites/SubscriptionBillingPolicy"));

const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const VerifyOTP = lazy(() => import("@/pages/auth/VerifyOTP"));
const VerifyEmail = lazy(() => import("@/pages/auth/VerifyEmail"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const Onboarding = lazy(() => import("@/pages/auth/Onboarding"));

const PricingPage = lazy(() => import("@/pages/sites/PricingPage"));
const SubscriptionSuccess = lazy(() => import("@/pages/sites/SubscriptionSuccess"));
const SubscriptionCancel = lazy(() => import("@/pages/sites/SubscriptionCancel"));

const PortfolioPreview = lazy(() => import("@/pages/admin/PortfolioPreview"));
const BrandView = lazy(() => import("@/components/admin/brandView/BrandView"));

const Dashboard = lazy(() => import("@/components/admin/Dashboard"));
const Campaign = lazy(() => import("@/components/admin/camping/Campaign"));
const CampaingDetails = lazy(() => import("@/components/admin/campingDetails/CampaingDetails"));
const Planner = lazy(() => import("@/components/admin/planner/Planner"));
const Invoices = lazy(() => import("@/components/admin/invoices/Invoices"));
const Portfolio = lazy(() => import("@/components/admin/portfolio/Portfolio"));
const FAQPage = lazy(() => import("@/components/admin/faq/FAQPage"));
const Setting = lazy(() => import("@/components/admin/setting/Setting"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const router = createBrowserRouter([
  // Public site routes
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: withSuspense(Home),
      },
      {
        path: "acceptable-use-policy",
        element: withSuspense(AcceptableUsePolicy),
      },
      {
        path: "cookie-policy",
        element: withSuspense(CookiePolicy),
      },
      {
        path: "privacy-policy",
        element: withSuspense(PrivacyPolicy),
      },
      {
        path: "subscription-billing-policy",
        element: withSuspense(SubscriptionBillingPolicy),
      },
    ],
  },
  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: withSuspense(Login) },
      { path: "signup", element: withSuspense(Register) },
      { path: "forgot-password", element: withSuspense(ForgotPassword) },
      { path: "verify-otp", element: withSuspense(VerifyOTP) },
      { path: "verify-email", element: withSuspense(VerifyEmail) },
      { path: "reset-password", element: withSuspense(ResetPassword) },
    ],
  },
  // Pricing
  {
    path: "pricing",
    element: withSuspense(PricingPage),
  },
  {
    path: "subscription/success",
    element: withSuspense(SubscriptionSuccess),
  },
  {
    path: "subscription/cancel",
    element: withSuspense(SubscriptionCancel),
  },
  // Onboarding (protected)
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "onboarding",
        element: withSuspense(Onboarding),
      },
    ],
  },
  // Public Portfolio Preview route
  {
    path: "preview/:slug",
    element: withSuspense(PortfolioPreview),
  },
  // Public Brand View route
  {
    path: "brand-view/:slug",
    element: withSuspense(BrandView),
  },
  // Admin dashboard routes (protected)
  {
    path: "dashboard",
    element: <PrivateRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: withSuspense(Dashboard) },
          { path: "campaigns", element: withSuspense(Campaign) },
          { path: "campaigns/:id", element: withSuspense(CampaingDetails) },
          { path: "campaigns/:id/brand-view", element: withSuspense(BrandView) },
          { path: "planner", element: withSuspense(Planner) },
          { path: "invoices", element: withSuspense(Invoices) },
          { path: "portfolio", element: withSuspense(Portfolio) },
          { path: "faq", element: withSuspense(FAQPage) },
          { path: "settings", element: withSuspense(Setting) },
        ],
      },
    ],
  },
  // Portfolio preview (protected, standalone — no admin layout)
  {
    path: "dashboard/portfolio/preview",
    element: <PrivateRoute />,
    children: [
      { index: true, element: withSuspense(PortfolioPreview) },
    ],
  },
  // 404
  {
    path: "*",
    element: withSuspense(NotFound),
  },
]);

export default router;
