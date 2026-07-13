import React, { lazy as reactLazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

// Layouts and Guards (Keep eager for immediate routing structure)
import AdminLayout from "@/layout/AdminLayout";
import Layout from "@/layout/Layout";
import AuthLayout from "@/layout/AuthLayout";
import Home from "@/pages/sites/Home";
import PrivateRoute from "@/components/auth/PrivateRoute";

// Safe lazy loading wrapper to catch chunk errors and reload the page automatically
const lazy = (importFunc) => {
  return reactLazy(() =>
    importFunc().catch((error) => {
      const isChunkError = 
        error.message?.includes("Failed to fetch dynamically imported module") ||
        error.message?.includes("dynamically imported module") ||
        error.message?.includes("Loading chunk") ||
        error.message?.includes("Failed to fetch");

      if (isChunkError) {
        console.warn("Dynamic import failed, reloading the page...", error);
        window.location.reload();
        return new Promise(() => {}); // Return pending promise to prevent UI crash during reload
      }
      throw error;
    })
  );
};

// Helper wrapper for Suspense fallback
const withSuspense = (Component, props = {}) => (
  <Suspense fallback={
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-Primary"></div>
    </div>
  }>
    <Component {...props} />
  </Suspense>
);

// Lazy Loaded Pages & Components
import PrivacyPolicy from "@/pages/sites/PrivacyPolicy";
const AcceptableUsePolicy = lazy(() => import("@/pages/sites/AcceptableUsePolicy"));
const CookiePolicy = lazy(() => import("@/pages/sites/CookiePolicy"));
const SubscriptionBillingPolicy = lazy(() => import("@/pages/sites/SubscriptionBillingPolicy"));
const FoundingCreatorAgreement = lazy(() => import("@/pages/sites/FoundingCreatorAgreement"));
const TermsOfService = lazy(() => import("@/pages/sites/TermsOfService"));

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
        element: <PrivacyPolicy />,
      },
      {
        path: "subscription-billing-policy",
        element: withSuspense(SubscriptionBillingPolicy),
      },
      {
        path: "founding-creator-agreement",
        element: withSuspense(FoundingCreatorAgreement),
      },
      {
        path: "terms-of-service",
        element: withSuspense(TermsOfService),
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
    element: withSuspense(PortfolioPreview, { isPublic: true }),
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
