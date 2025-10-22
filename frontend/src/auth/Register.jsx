import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { registerUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    role: "sales",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(formData);
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#009540]/10 via-white to-[#FFD200]/10 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl transition-transform duration-300 hover:scale-[1.01]">
        {/* Logo + Header */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo.png"
            alt="Unibrain Logo"
            className="w-28 h-20 object-contain"
          />
          <h1 className="text-2xl font-extrabold text-[#009540] mt-2">
            Create Your Account
          </h1>
          <p className="text-sm text-gray-600">
            Join Unibrain ERP Platform
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-2 text-center text-red-600">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              name="first_name"
              placeholder="First Name"
              onChange={handleChange}
              className="rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#009540]/30 focus:border-[#009540] outline-none"
            />
            <input
              name="last_name"
              placeholder="Last Name"
              onChange={handleChange}
              className="rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#009540]/30 focus:border-[#009540] outline-none"
            />
          </div>

          <input
            name="username"
            placeholder="Username"
            required
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#009540]/30 focus:border-[#009540] outline-none"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#009540]/30 focus:border-[#009540] outline-none"
          />

          <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#009540]/30 focus:border-[#009540] outline-none"
          />

          <select
            name="role"
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#009540]/30 focus:border-[#009540] outline-none"
          >
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="warehouse">Warehouse</option>
            <option value="factory_ops">Factory Operator</option>
            <option value="admin">Administrator</option>
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#009540]/30 focus:border-[#009540] outline-none"
            />
            <input
              name="password2"
              type="password"
              placeholder="Confirm Password"
              required
              onChange={handleChange}
              className="rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#009540]/30 focus:border-[#009540] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg bg-[#009540] py-2.5 text-white font-semibold transition duration-300 hover:bg-[#007A34] ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="cursor-pointer text-[#009540] font-semibold hover:underline"
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
