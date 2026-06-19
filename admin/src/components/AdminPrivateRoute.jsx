import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/redux/slices/authSlice";

const AdminPrivateRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector((state) => state.ui.user);

  // In development, the user might be loaded asynchronously, so we check if authenticated is set.
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminPrivateRoute;
