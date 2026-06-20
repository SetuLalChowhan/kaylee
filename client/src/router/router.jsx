import Dashboard from "@/components/admin/Dashboard";
import AdminLayout from "@/layout/AdminLayout";
import Layout from "@/layout/Layout";
import AuthLayout from "@/layout/AuthLayout";
import Home from "@/pages/sites/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import VerifyOTP from "@/pages/auth/VerifyOTP";
import ResetPassword from "@/pages/auth/ResetPassword";
import Onboarding from "@/pages/auth/Onboarding";
import PricingPage from "@/pages/sites/PricingPage";
import SubscriptionSuccess from "@/pages/sites/SubscriptionSuccess";
import SubscriptionCancel from "@/pages/sites/SubscriptionCancel";
import { createBrowserRouter } from "react-router-dom";
import Planner from "@/components/admin/planner/Planner";
import Invoices from "@/components/admin/invoices/Invoices";
import Portfolio from "@/components/admin/portfolio/Portfolio";
import PortfolioPreview from "@/pages/admin/PortfolioPreview";
import FAQPage from "@/components/admin/faq/FAQPage";
import Setting from "@/components/admin/setting/Setting";
import Campaign from "@/components/admin/camping/Campaign";
import CampaingDetails from "@/components/admin/campingDetails/CampaingDetails";
import BrandView from "@/components/admin/brandView/BrandView";
import NotFound from "@/pages/NotFound";
import PrivateRoute from "@/components/auth/PrivateRoute";

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
    ],
  },
  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "verify-otp", element: <VerifyOTP /> },
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
  // Onboarding (public — user arrives here after email verification, before logging in)
  {
    path: "onboarding",
    element: <Onboarding />,
  },
  // Public Portfolio Preview route
  {
    path: "preview/:slug",
    element: <PortfolioPreview isPublic={true} />,
  },
  // Public Brand View route
  {
    path: "brand-view/:slug",
    element: <BrandView isPublic={true} />,
  },
  // Admin dashboard routes (protected)
  {
    path: "dashboard",
    element: <PrivateRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "campaigns", element: <Campaign /> },
          { path: "campaigns/:id", element: <CampaingDetails /> },
          { path: "campaigns/:id/brand-view", element: <BrandView /> },
          { path: "planner", element: <Planner /> },
          { path: "invoices", element: <Invoices /> },
          { path: "portfolio", element: <Portfolio /> },
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
