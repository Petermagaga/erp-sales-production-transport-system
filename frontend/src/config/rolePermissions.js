export const rolePermissions = {
  admin: [
    "dashboard",
    "sales",
    "production",
    "transport",
    "warehouse",
    "marketing",
    "admin"
  ],

  sales: ["dashboard", "sales"],
  marketing: ["dashboard", "sales", "marketing"],
  warehouse: ["dashboard", "warehouse"],
  transporter: ["dashboard", "transport"],
};
