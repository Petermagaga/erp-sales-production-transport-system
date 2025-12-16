import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { rolePermissions } from "../config/rolePermissions";

const ProtectedRoute = ({ children, module }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowedModules = rolePermissions[user.role] || [];

  if (!allowedModules.includes(module)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
