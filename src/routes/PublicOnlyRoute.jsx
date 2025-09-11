import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, getDashboardPath } from "@/auth";

const PublicOnlyRoute = () => {
  if (isAuthenticated()) {
    return <Navigate to={getDashboardPath()} replace />;
  }
  return <Outlet />;
};

export default PublicOnlyRoute;
