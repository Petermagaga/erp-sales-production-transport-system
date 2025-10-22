import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50 rounded-tl-3xl shadow-inner">
          <Outlet />  {/* 👈 This is where Dashboard, SalesList, etc. will render */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
