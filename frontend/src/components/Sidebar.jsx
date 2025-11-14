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
  Scale3DIcon,
  Package,
  AtomIcon,
  VoteIcon,
  DnaIcon,
  MapIcon,
  BikeIcon,
  ChevronDown,
  ChevronRight,
  MegaphoneIcon, // for Sales & Marketing
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },

    {
      name: "Sales & Marketing",
      icon: MegaphoneIcon,
      children: [
        { name: "Customers", path: "/customers" },
        { name: "Sales Records", path: "/sales" },
        { name: "Sales Analytics", path: "/analytics" },
      ],
    },

    {
      name: "Production",
      icon: Package,
      children: [
        { name: "Production List", path: "/production" },
        { name: "Production Analytics", path: "/production/analytics" },
      ],
    },

    {
      name: "Transport",
      icon: BikeIcon,
      children: [
        { name: "Transport Analytics", path: "/transport/analytics" },
        { name: "Transport List", path: "/transport/list" },
      ],
    },

    {
      name: "Warehouse",
      icon: DnaIcon,
      children: [
        { name: "Warehouse Dashboard", path: "/analyticsdashboard" },
        { name: "Warehouse Layout", path: "/dashboardlay" },
        { name: "Warehouse Analytics", path: "/warehouseanalytics" },
      ],
    },
  ];

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`${
        isOpen ? "w-64" : "w-20"
      } min-h-screen flex flex-col transition-all duration-300
      bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-800
      text-amber-400 border-r border-amber-500/10 shadow-2xl`}
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
              className="font-bold text-lg tracking-wide text-amber-400"
            >
              UniBrain ERP
            </motion.h2>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-amber-300"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;

          // Dropdown groups
          if (item.children) {
            return (
              <div key={item.name} className="mx-2">
                <button
                  onClick={() => toggleDropdown(item.name)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-emerald-800/60 text-amber-300"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    {isOpen && <span className="font-medium text-sm">{item.name}</span>}
                  </div>
                  {isOpen &&
                    (openDropdown === item.name ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    ))}
                </button>

                <AnimatePresence>
                  {openDropdown === item.name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="ml-8 mt-1 space-y-1 overflow-hidden"
                    >
                      {item.children.map((sub) => (
                        <NavLink
                          key={sub.name}
                          to={sub.path}
                          className={({ isActive }) =>
                            `block px-3 py-2 rounded-md text-sm transition ${
                              isActive
                                ? "bg-emerald-700 text-amber-300"
                                : "text-amber-200 hover:bg-emerald-800"
                            }`
                          }
                        >
                          {sub.name}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          // Single items
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 mx-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-emerald-700 shadow-inner border border-amber-400/30"
                    : "hover:bg-emerald-800/60"
                }`
              }
            >
              <Icon size={20} className="text-amber-300" />
              {isOpen && <span className="text-sm font-medium">{item.name}</span>}
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
            >
              <p className="text-xs text-amber-400 uppercase">{user?.role || "User"}</p>
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
