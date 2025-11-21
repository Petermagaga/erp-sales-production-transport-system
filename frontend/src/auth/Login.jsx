import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (username === "admin" && password === "1234") {
      // Fake token, fake user, anything you want
      loginUser("admin", "1234");
      navigate("/");
      setLoading(false);
      return;
    }

    try {
      await loginUser(username, password);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#009540]/10 via-white to-[#FFD200]/10 items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-8 transition-transform duration-300 hover:scale-[1.01]">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo.png"
            alt="Unibrain Logo"
            className="w-28 h-20 object-contain"
          />
          <h1 className="text-2xl font-extrabold text-[#009540] mt-2">
            Unibrain ERP Portal
          </h1>
          <p className="text-sm text-gray-600">
            Developing Agro-industry Value Chains
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-2 text-center text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#009540] focus:ring-2 focus:ring-[#009540]/30 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#009540] focus:ring-2 focus:ring-[#009540]/30 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg bg-[#009540] py-2.5 text-white font-semibold transition duration-300 hover:bg-[#007A34] ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="cursor-pointer text-[#009540] font-semibold hover:underline"
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
