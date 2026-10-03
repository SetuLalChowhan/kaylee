import React from "react";
import { createBrowserRouter } from "react-router-dom";

// Layouts and Guards (Keep eager for immediate routing structure)
import AdminLayout from "@/layout/AdminLayout";
import Layout from "@/layout/Layout";
import AuthLayout from "@/layout/AuthLayout";
import Home from "@/pages/sites/Home";
import PrivateRoute from "@/components/auth/PrivateRoute";

// Pages & Components (Static Imports)
import PrivacyPolicy from "@/pages/sites/PrivacyPolicy";
import AcceptableUsePolicy from "@/pages/sites/AcceptableUsePolicy";
import CookiePolicy from "@/pages/sites/CookiePolicy";
import SubscriptionBillingPolicy from "@/pages/sites/SubscriptionBillingPolicy";
import FoundingCreatorAgreement from "@/pages/sites/FoundingCreatorAgreement";
import TermsOfService from "@/pages/sites/TermsOfService";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import ResetPassword from "@/pages/auth/ResetPassword";
import Onboarding from "@/pages/auth/Onboarding";

import PricingPage from "@/pages/sites/PricingPage";
import SubscriptionSuccess from "@/pages/sites/SubscriptionSuccess";
import SubscriptionCancel from "@/pages/sites/SubscriptionCancel";

import PortfolioPreview from "@/pages/admin/PortfolioPreview";
import BrandView from "@/components/admin/brandView/BrandView";

import { Suspense, lazy } from "react";

const Dashboard = lazy(() => import("@/components/admin/Dashboard"));
const Campaign = lazy(() => import("@/components/admin/camping/Campaign"));
const CampaingDetails = lazy(() => import("@/components/admin/campingDetails/CampaingDetails"));
const Planner = lazy(() => import("@/components/admin/planner/Planner"));
const Invoices = lazy(() => import("@/components/admin/invoices/Invoices"));
const Portfolio = lazy(() => import("@/components/admin/portfolio/Portfolio"));

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
    {children}
  </Suspense>
);
import FAQPage from "@/components/admin/faq/FAQPage";
import Setting from "@/components/admin/setting/Setting";
import NotFound from "@/pages/NotFound";

const router = createBrowserRouter([
  // Public site routes
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "acceptable-use-policy",
        element: <AcceptableUsePolicy />,
      },
      {
        path: "cookie-policy",
        element: <CookiePolicy />,
      },
      {
        path: "privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "subscription-billing-policy",
        element: <SubscriptionBillingPolicy />,
      },
      {
        path: "founding-creator-agreement",
        element: <FoundingCreatorAgreement />,
      },
      {
        path: "terms-of-service",
        element: <TermsOfService />,
      },
    ],
  },
  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "reset-password", element: <ResetPassword /> },
    ],
  },
  // Pricing
  {
    path: "pricing",
    element: <PricingPage />,
  },
  {
    path: "subscription/success",
    element: <SubscriptionSuccess />,
  },
  {
    path: "subscription/cancel",
    element: <SubscriptionCancel />,
  },
  // Onboarding (protected)
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "onboarding",
        element: <Onboarding />,
      },
    ],
  },
  // Public Portfolio Preview route
  {
    path: "preview/:slug",
    element: <PortfolioPreview isPublic={true} />,
  },
  // Public Brand View route
  {
    path: "brand-view/:slug",
    element: <BrandView />,
  },
  // Admin dashboard routes (protected)
  {
    path: "dashboard",
    element: <PrivateRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <SuspenseWrapper><Dashboard /></SuspenseWrapper> },
          { path: "campaigns", element: <SuspenseWrapper><Campaign /></SuspenseWrapper> },
          { path: "campaigns/:id", element: <SuspenseWrapper><CampaingDetails /></SuspenseWrapper> },
          { path: "campaigns/:id/brand-view", element: <BrandView /> },
          { path: "planner", element: <SuspenseWrapper><Planner /></SuspenseWrapper> },
          { path: "invoices", element: <SuspenseWrapper><Invoices /></SuspenseWrapper> },
          { path: "portfolio", element: <SuspenseWrapper><Portfolio /></SuspenseWrapper> },
          { path: "faq", element: <FAQPage /> },
          { path: "settings", element: <Setting /> },
        ],
      },
    ],
  },
  // Portfolio preview (protected, standalone — no admin layout)
  {
    path: "dashboard/portfolio/preview",
    element: <PrivateRoute />,
    children: [
      { index: true, element: <PortfolioPreview /> },
    ],
  },
  // 404
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
