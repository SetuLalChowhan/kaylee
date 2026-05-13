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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },

    ],
  },
  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/verify-otp", element: <VerifyOTP /> },
      { path: "/reset-password", element: <ResetPassword /> },
    ]
  },
  // Onboarding route (separate layout/style)
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
  {
    path: "/pricing",
    element: <PricingPage />,
  },
  {
    path: "/dashboard/portfolio/preview",
    element: <PortfolioPreview />,
  },
  // Admin routes
  {
    path: "/dashboard",
    element: <AdminLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/dashboard/campaigns",
        element: <Campaign />,
      },
      {
        path: "/dashboard/campaigns/:id",
        element: <CampaingDetails />,
      },
      {
        path: "/dashboard/planner",
        element: <Planner />,
      },
      {
        path: "/dashboard/invoices",
        element: <Invoices />,
      },
      {
        path: "/dashboard/portfolio",
        element: <Portfolio />,
      },
      {
        path: "/dashboard/faq",
        element: <FAQPage />,
      },
      {
        path: "/dashboard/settings",
        element: <Setting />,
      },
      {
        path: "/dashboard/campaigns/:id/brand-view",
        element: <BrandView />,
      }

    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
