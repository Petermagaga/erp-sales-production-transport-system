import { useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { rolePermissions } from "../config/rolePermissions";

const usePermissions = () => {
  const { user } = useContext(AuthContext);

  const permissions = useMemo(() => {
    return rolePermissions[user?.role] || [];
  }, [user]);

  const canAccess = (module) => permissions.includes(module);

  return {
    user,
    canAccess,
  };
};

export default usePermissions;
