// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import API from "../api/axios";

export const AuthContext = createContext();

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const MOCK_USERNAME = "admin";
const MOCK_PASSWORD = "1234";

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");
    return access && refresh ? { access, refresh } : null;
  });

  const [user, setUser] = useState(() => {
    const access = localStorage.getItem("access");
    if (!access || access === "mock-token") return null;
    try {
      return jwtDecode(access);
    } catch {
      return null;
    }
  });

  // --------------------------------
  // LOGIN
  // --------------------------------
  const loginUser = async (username, password) => {
    // MOCK LOGIN (DEV ONLY)
    if (USE_MOCK && username === MOCK_USERNAME && password === MOCK_PASSWORD) {
      const fakeToken = "mock-token";
      localStorage.setItem("access", fakeToken);
      localStorage.setItem("refresh", fakeToken);
      setAuthTokens({ access: fakeToken, refresh: fakeToken });
      setUser({ username: "mock_admin", role: "admin" });
      return { mock: true };
    }

    try {
      const res = await API.post("token/", { username, password });
      const data = res.data;

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      setAuthTokens({ access: data.access, refresh: data.refresh });
      setUser(data.user || jwtDecode(data.access));

      return data;
    } catch (err) {
      throw err;
    }
  };

  // --------------------------------
  // REGISTER
  // --------------------------------
  const registerUser = async (registerData) => {
    const res = await API.post("accounts/register/", registerData);
    return res.data;
  };

  // --------------------------------
  // LOGOUT
  // --------------------------------
  const logoutUser = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setAuthTokens(null);
    setUser(null);
  };

  // --------------------------------
  // TOKEN REFRESH
  // --------------------------------
  const updateToken = async () => {
    if (!authTokens?.refresh) return;
    if (authTokens.access === "mock-token") return;

    try {
      const res = await API.post("token/refresh/", {
        refresh: authTokens.refresh,
      });

      localStorage.setItem("access", res.data.access);
      setAuthTokens((prev) => ({ ...prev, access: res.data.access }));
      setUser(jwtDecode(res.data.access));
    } catch {
      logoutUser();
    }
  };

  useEffect(() => {
    if (!authTokens) return;
    const interval = setInterval(updateToken, 1000 * 60 * 10);
    return () => clearInterval(interval);
  }, [authTokens]);

  return (
    <AuthContext.Provider
      value={{
        user,
        authTokens,
        loginUser,
        registerUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
