import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  ShoppingBag,
  BarChart3,
  Briefcase,
  Scale3DIcon,
  Package,
  ClipboardList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Sales Records", path: "/sales", icon: BarChart3 },
    { name: "Customers", path: "/customers", icon: Users },
    { name: "Products", path: "/products", icon: ShoppingBag },
    { name: "Campaigns", path: "/campaigns", icon: Briefcase },
    // From your second sidebar
    { name: "Production List", path: "/production", icon: Package },
    { name: "Production Analytics", path: "/production/analytics", icon: Scale3DIcon },
    // Keep existing analytics last
    { name: "Sales Analytics", path: "/analytics", icon: BarChart3 },
  ];

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`${
        isOpen ? "w-64" : "w-20"
      } min-h-screen flex flex-col transition-all duration-300
      bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-800
      text-amber-400 backdrop-blur-xl border-r border-amber-500/10 shadow-2xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-amber-500/20">
        <AnimatePresence>
          {isOpen && (
            <motion.h2
              key="title"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-bold text-lg tracking-wide text-amber-400 drop-shadow-sm"
            >
              UniBrain ERP
            </motion.h2>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-amber-300 transition"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500/30">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 mx-3 px-4 py-3 rounded-xl relative overflow-hidden
                transition-all duration-300 ${
                  isActive
                    ? "bg-emerald-700/80 shadow-inner border border-amber-400/30"
                    : "hover:bg-emerald-800/60 hover:border hover:border-amber-400/20"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 w-[4px] h-full bg-amber-400 rounded-r-lg shadow-md"
                    />
                  )}
                  <Icon
                    size={20}
                    className={`shrink-0 ${
                      isActive
                        ? "text-amber-400"
                        : "text-amber-300 group-hover:text-amber-200"
                    }`}
                  />
                  {isOpen && (
                    <span
                      className={`truncate text-sm font-medium ${
                        isActive
                          ? "text-amber-300"
                          : "text-amber-200 group-hover:text-amber-100"
                      }`}
                    >
                      {item.name}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-amber-400/10 p-4 bg-emerald-900/50">
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              key="footerOpen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs text-amber-400 uppercase tracking-wider">
                {user?.role || "User"}
              </p>
              <p className="text-sm text-amber-300 font-medium truncate">
                {user?.email || "example@email.com"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="footerCollapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center text-xs text-amber-300 font-semibold"
            >
              {user?.role?.[0]?.toUpperCase() || "U"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
