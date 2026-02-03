import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";
// Auth pages
import Login from "./auth/Login";
import Register from "./auth/Register";
import PrivateRoute from "./auth/PrivateRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";

// Layout & pages
import DashboardLayout from "./layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";

// Sales
import SalesList from "./pages/sales/SalesList";
import AddSale from "./pages/sales/AddSale";
import EditSale from "./pages/sales/EditSale";
import ViewSale from "./pages/sales/ViewSale";
import SalesAnalytics from "./pages/analytics/SalesAnalytics";

// Production
import ProductionList from "./pages/production/ProductionList";
import AddProduction from "./pages/production/AddProduction";
import EditProduction from "./pages/production/EditProduction";
import ProductionAnalytics from "./pages/production/ProductionAnalytics";

// Transport
import TransportList from "./pages/transport/TransportList";
import AddTransport from "./pages/transport/AddTransport";
import EditTransport from "./pages/transport/EditTransport";
import TransportAnalytics from "./pages/transport/TransportAnalytics";

// Warehouse
import AddWarehouse from "./pages/warehouse/AddWarehouse";
import Dashboards from "./pages/warehouse/Dashboards";
import WarehouseAnalytics from "./pages/warehouse/WarehouseAnalytics";
import AnalyticsDashboard from "./pages/warehouse/AnalyticsDasboard";

// Others
import Products from "./pages/Products";
import CustomersList from "./pages/CustomersList";
import Campaigns from "./pages/campaigns";

import PendingUsers from "./pages/admin/PendingUsers";
import Users from "./pages/admin/Users";
import AuditLogs from "./pages/admin/AuditLogs";

import MillingDashboard from "./pages/milling/MillingDashboard";
import MillingList from "./pages/milling/MillingList";
import AddMilling from "./pages/milling/AddMilling";
import ExecutiveDashboard from "./pages/executive/ExecutiveDashboard";

import MyLeave from "./pages/MyLeave";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Authenticated routes */}
          <Route
            path="/"
            element={
              <PrivateRoute allowedRoles={["admin", "sales", "marketing", "warehouse", "transport"]}>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* ================= SALES MODULE ================= */}
            <Route
              path="sales"
              element={
                <ProtectedRoute module="sales">
                  <SalesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="sales/add"
              element={
                <ProtectedRoute module="sales">
                  <AddSale />
                </ProtectedRoute>
              }
            />
            <Route
              path="sales/edit/:id"
              element={
                <ProtectedRoute module="sales">
                  <EditSale />
                </ProtectedRoute>
              }
            />
            <Route
              path="sales/view/:id"
              element={
                <ProtectedRoute module="sales">
                  <ViewSale />
                </ProtectedRoute>
              }
            />
            <Route
              path="analytics"
              element={
                <ProtectedRoute module="sales">
                  <SalesAnalytics />
                </ProtectedRoute>
              }
            />

            {/* ================= PRODUCTION MODULE ================= */}
            <Route
              path="production"
              element={
                <ProtectedRoute module="production">
                  <ProductionList />
                </ProtectedRoute>
              }
            />
            <Route
              path="production/add"
              element={
                <ProtectedRoute module="production">
                  <AddProduction />
                </ProtectedRoute>
              }
            />
            <Route
              path="production/edit/:id"
              element={
                <ProtectedRoute module="production">
                  <EditProduction />
                </ProtectedRoute>
              }
            />
            <Route
              path="production/analytics"
              element={
                <ProtectedRoute module="production">
                  <ProductionAnalytics />
                </ProtectedRoute>
              }
            />

            {/* ================= TRANSPORT MODULE ================= */}
            <Route
              path="transport/list"
              element={
                <ProtectedRoute module="transport">
                  <TransportList />
                </ProtectedRoute>
              }
            />
            <Route
              path="transport/add"
              element={
                <ProtectedRoute module="transport">
                  <AddTransport />
                </ProtectedRoute>
              }
            />
            <Route
              path="transport/edit/:id"
              element={
                <ProtectedRoute module="transport">
                  <EditTransport />
                </ProtectedRoute>
              }
            />
            <Route
              path="transport/analytics"
              element={
                <ProtectedRoute module="transport">
                  <TransportAnalytics />
                </ProtectedRoute>
              }
            />

            {/* ================= WAREHOUSE MODULE ================= */}
            <Route
              path="dashboardlay"
              element={
                <ProtectedRoute module="warehouse">
                  <Dashboards />
                </ProtectedRoute>
              }
            />

            <Route path="/milling/dashboard" element={<MillingDashboard />} />
            <Route path="/milling/millinglist" element={<MillingList />} />
            <Route path="/milling/add" element={<AddMilling />} />


            <Route
              path="addwarehouse"
              element={
                <ProtectedRoute module="warehouse">
                  <AddWarehouse />
                </ProtectedRoute>
              }
            />



            <Route
              path="warehouseanalytics"
              element={
                <ProtectedRoute module="warehouse">
                  <WarehouseAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="analyticsdashboard"
              element={
                <ProtectedRoute module="warehouse">
                  <AnalyticsDashboard />
                </ProtectedRoute>
              }
            />

            {/* ================= MARKETING ================= */}
            <Route
              path="campaigns"
              element={
                <ProtectedRoute module="marketing">
                  <Campaigns />
                </ProtectedRoute>
              }
            />

            <Route 
            path="admin/PendingUsers"
            element={
              <ProtectedRoute module="admin">
                <PendingUsers />
              </ProtectedRoute>}
            />

            {/* Shared */}
            <Route path="products" element={<Products />} />
            <Route path="customers" element={<CustomersList />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Unauthorized />} />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute module="admin">
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
        path="/admin/AuditLogs"
        element={
          <ProtectedRoute module="admin">
            <AuditLogs/>
          </ProtectedRoute>
        }
        />


        <Route
          path="/executive"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <ExecutiveDashboard />
            </PrivateRoute>
          }
        />

          <Route
          path="/leave"
          element={
            <ProtectedRoute module="leave">
              <MyLeave/>
            </ProtectedRoute>

          }
          />

        </Routes>



    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "10px",
            background: "#fff",
            color: "#333",
          },
        }}
      />
      {/* your routes */}
    </>


        <ToastContainer position="top-right" autoClose={2500} theme="colored" />
      </AuthProvider>
    </BrowserRouter>





);
}

export default App;