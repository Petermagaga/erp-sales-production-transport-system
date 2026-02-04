import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import usePermissions from "../hooks/usePermissions";

import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  BikeIcon,
  DnaIcon,
  ChevronDown,
  ChevronRight,
  MegaphoneIcon,
  LeafIcon,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";




const Sidebar = () => {
  const { user, canAccess } = usePermissions();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const menuItems = [

    {
      name: "Executive Dashboard",
      path: "/executive",
      icon: LayoutDashboard,
      module: "admin", // or "executive" if you have that permission
      role: "admin",   // 👈 custom role check
    },


    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      module: "dashboard",
    },

    {
      name: "Leave",
      icon: LeafIcon,
      module: "leave",
      children: [
        {
          name: "My Leave",
          path: "/leave",
          module: "leave",
        },
        {
          name:"Manage Leave",
          path:"/leave/manage",
          module:"leave",
          role:"hr",
        }

      ],
    },
    

    {
      name: "Sales & Marketing",
      icon: MegaphoneIcon,
      module: "sales",
      children: [
        { name: "Customers", path: "/customers", module: "sales" },
        { name: "Sales Records", path: "/sales", module: "sales" },
        { name: "Sales Analytics", path: "/analytics", module: "sales" },
      ],
    },
    {
      name: "Production",
      icon: Package,
      module: "production",
      children: [
        { name: "NacoNek List", path: "/production", module: "production" },
        {
          name: "NacoNek Analytics",
          path: "/production/analytics",
          module: "production",
        },

        {
          name: "Malkia Dashboard",
          path: "/milling/dashboard",
          module:"production"
        },
        {
          name:"Malkia List",
          path:"/milling/millinglist",
          module:"production"
        }

      ],
    },
    {
      name: "Transport",
      icon: BikeIcon,
      module: "transport",
      children: [
        {
          name: "Transport Analytics",
          path: "/transport/analytics",
          module: "transport",
        },
        {
          name: "Transport List",
          path: "/transport/list",
          module: "transport",
        },
      ],
    },
    {
      name: "Warehouse",
      icon: DnaIcon,
      module: "warehouse",
      children: [
        {
          name: "Warehouse Dashboard",
          path: "/analyticsdashboard",
          module: "warehouse",
        },
        { name: "Warehouse Layout", path: "/dashboardlay", module: "warehouse" },
        {
          name: "Warehouse Analytics",
          path: "/warehouseanalytics",
          module: "warehouse",
        },
      ],
    },

    {
      name: "Admin",
      icon: LayoutDashboard, // or ShieldCheck if you prefer
      module: "admin",
      role:"admin",
      children: [
        {
          name: "Pending Users",
          path: "/admin/PendingUsers",
          module: "admin",
        },
        {
          name: "User Management",
          path: "/admin/users",
          module: "admin",
        },

        {
          name: "Audit Logs",
          path: "/admin/AuditLogs",
          module: "admin",
        }


      ],
    },




  ];

  const isGroupActive = (children = []) =>
    children.some((c) => location.pathname.startsWith(c.path));

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`${
        isOpen ? "w-64" : "w-20"
      } min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-800
      text-amber-300 border-r border-amber-400/10 transition-all duration-300 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-amber-400/10">
        <AnimatePresence>
          {isOpen && (
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-bold tracking-wide"
            >
              UniBrain ERP
            </motion.h2>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {

          if (item.role && user?.role !== item.role) {
            return null;
          }

          const Icon = item.icon;
          const allowed = canAccess(item.module);
          const groupActive = isGroupActive(item.children);

          // role-based visibility (extra check)


          if (item.children) {
            return (
              <div key={item.name} className="mx-2">
                <button
                  onClick={() => allowed && toggleDropdown(item.name)}
                  title={!isOpen ? item.name : ""}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition
                    ${
                      allowed
                        ? groupActive
                          ? "bg-emerald-700/60 text-amber-200"
                          : "hover:bg-emerald-800/60"
                        : "opacity-40 cursor-not-allowed"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    {isOpen && <span>{item.name}</span>}
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
                      className="ml-8 mt-1 space-y-1 overflow-hidden"
                    >
                      {item.children.map((sub) => {
                        const subAllowed = canAccess(sub.module);

                        return (
                          <NavLink
                            key={sub.name}
                            to={subAllowed ? sub.path : "#"}
                            onClick={(e) =>
                              !subAllowed && e.preventDefault()
                            }
                            className={({ isActive }) =>
                              `block px-3 py-2 rounded-md text-sm transition
                              ${
                                subAllowed
                                  ? isActive
                                    ? "bg-emerald-700 text-amber-300"
                                    : "hover:bg-emerald-800"
                                  : "opacity-40 cursor-not-allowed"
                              }`
                            }
                          >
                            {sub.name}
                          </NavLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          // SINGLE ITEM
          return (
            <NavLink
              key={item.name}
              to={allowed ? item.path : "#"}
              onClick={(e) => !allowed && e.preventDefault()}
              title={!isOpen ? item.name : ""}
              className={({ isActive }) =>
                `flex items-center gap-3 mx-3 px-4 py-3 rounded-xl transition
                ${
                  allowed
                    ? isActive
                      ? "bg-emerald-700 border border-amber-400/30"
                      : "hover:bg-emerald-800/60"
                    : "opacity-40 cursor-not-allowed"
                }`
              }
            >
              <Icon size={20} />
              {isOpen && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-amber-400/10 p-4">
        {isOpen ? (
          <>
            <p className="text-xs uppercase text-amber-400">
              {user?.role || "User"}
            </p>
            <p className="text-sm truncate">{user?.email}</p>
          </>
        ) : (
          <div className="text-center font-bold">
            {user?.role?.[0]?.toUpperCase() || "U"}
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
