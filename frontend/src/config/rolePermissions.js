export const rolePermissions = {
  admin: [
    "dashboard",
    "sales",
    "production",
    "transport",
    "warehouse",
    "marketing",
    "leave",
    "admin",
  ],

  sales: ["dashboard", "sales"],
  marketing: ["dashboard", "sales", "marketing"],
  warehouse: ["dashboard", "warehouse"],
  transporter: ["dashboard", "transport"],
  hr:["dashboard","leave"],
};
