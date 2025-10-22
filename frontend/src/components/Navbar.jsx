import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);

  return (
    <header className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Logo and App Info */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Unibrain Logo"
            className="w-10 h-10 rounded-md object-contain shadow-sm"
          />
          <div>
            <h1 className="text-lg font-extrabold text-[#009540]">
              Unibrain ERP
            </h1>
            <p className="text-xs text-gray-500">
              Developing Agro-industry Value Chains
            </p>
          </div>
        </div>

        {/* Center: Welcome message */}
        <div className="hidden md:flex flex-col items-center">
          <p className="text-sm text-gray-500">Welcome,</p>
          <p className="font-semibold text-gray-700 capitalize">
            {user?.first_name || user?.username || "User"}
          </p>
        </div>

        {/* Right: Role + Avatar + Logout */}
        <div className="flex items-center gap-4">
          {user?.role && (
            <span className="text-xs md:text-sm text-[#009540] bg-[#009540]/10 border border-[#009540]/30 px-3 py-1 rounded-full capitalize font-medium">
              {user.role}
            </span>
          )}

          <img
            src={`https://ui-avatars.com/api/?name=${user?.first_name || user?.username || "User"}&background=009540&color=fff`}
            alt="User Avatar"
            className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
          />

          <button
            onClick={logoutUser}
            className="flex items-center gap-2 bg-[#FFD200] text-[#009540] px-3 py-1.5 rounded-lg font-semibold hover:bg-[#ffcc00] transition duration-300"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
