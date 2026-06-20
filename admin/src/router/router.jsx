import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Login from "@/pages/Login";
import Dashboard from "@/components/admin/Dashboard";
import AdminLayout from "@/layout/AdminLayout";
import AdminPrivateRoute from "@/components/AdminPrivateRoute";
import UserList from "@/pages/admin/UserList";
import CampaignList from "@/pages/admin/CampaignList";
import CampaignDetails from "@/pages/admin/CampaignDetails";
import TaskList from "@/pages/admin/TaskList";
import InvoiceList from "@/pages/admin/InvoiceList";
import CmsEditor from "@/pages/admin/CmsEditor";
import Settings from "@/pages/admin/Settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <AdminPrivateRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "users", element: <UserList /> },
          { path: "campaigns", element: <CampaignList /> },
          { path: "campaigns/:id", element: <CampaignDetails /> },
          { path: "tasks", element: <TaskList /> },
          { path: "invoices", element: <InvoiceList /> },
          { path: "cms", element: <CmsEditor /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
]);

export default router;
