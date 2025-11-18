import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Auth pages
import Login from "./auth/Login";
import Register from "./auth/Register";
import PrivateRoute from "./auth/PrivateRoute";
import Unauthorized from "./pages/Unauthorized";

// Layout & pages
import DashboardLayout from "./layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import SalesList from "./pages/sales/SalesList";
import AddSale from "./pages/sales/AddSale";
import EditSale from "./pages/sales/EditSale";
import ViewSale from "./pages/sales/ViewSale";
import Products from "./pages/Products";
import Campaigns from "./pages/campaigns";
import CustomersList from "./pages/CustomersList";
import SalesAnalytics from "./pages/analytics/SalesAnalytics";
import ProductionList from "./pages/production/ProductionList";
import AddProduction from "./pages/production/AddProduction";
import EditProduction from "./pages/production/EditProduction";
import ProductionAnalytics from "./pages/production/ProductionAnalytics";
import TransportList from "./pages/transport/TransportList";
import AddTransport from "./pages/transport/AddTransport";
import TransportAnalytics from "./pages/transport/TransportAnalytics";
import EditTransport from "./pages/transport/EditTransport";
import AddWarehouse from "./pages/warehouse/AddWarehouse";
import Dashboards from "./pages/warehouse/Dashboards";
import WarehouseAnalytics from "./pages/warehouse/WarehouseAnalytics";
import AnalyticsDashboard from "./pages/warehouse/AnalyticsDasboard";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Private routes (Dashboard layout wrapper) */}
          <Route
            path="/"
            element={
              <PrivateRoute allowedRoles={["admin", "sales", "marketing"]}>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            {/* Dashboard pages */}
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="sales" element={<SalesList />} />
            <Route path="sales/add" element={<AddSale />} />
            <Route path="sales/edit/:id" element={<EditSale />} />
            <Route path="sales/view/:id" element={<ViewSale />} />
            <Route path="products" element={<Products />} />
            <Route path="analytics" element={<SalesAnalytics />} />
            <Route path="customers" element={<CustomersList />} />

            {/* Production pages */}
            <Route path="production" element={<ProductionList />} />
            <Route path="production/add" element={<AddProduction />} />
            <Route path="production/edit/:id" element={<EditProduction />} />
            <Route path="production/analytics" element={<ProductionAnalytics />} />
            
            <Route path="transport/list" element={<TransportList />} />
            <Route path="transport/add" element={<AddTransport />} />
            <Route path="transport/analytics" element={<TransportAnalytics />} />
            <Route path="transport/edit/:id" element={<EditTransport />} />

              {/*Warehouse */}
                       
            <Route path="/analyticsdashboard" element={<AnalyticsDashboard/>}/>
            <Route path="/warehouseanalytics"element={<WarehouseAnalytics/>}/>
            <Route path="/dashboardlay" element={<Dashboards/>}/>
            <Route path="/addwarehouse" element= {<AddWarehouse/>} />
            {/* Marketing pages */}
            <Route
              path="campaigns"
              element={
                <PrivateRoute allowedRoles={["admin", "marketing"]}>
                  <Campaigns />
                </PrivateRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Unauthorized />} />
        </Routes>

        {/* ✅ Toast notifications visible on all pages */}
        <ToastContainer
          position="top-right"
          autoClose={2500}
          theme="colored"
          hideProgressBar={false}
        />
      </AuthProvider>
  
    </BrowserRouter>



  );
};


export default App;
