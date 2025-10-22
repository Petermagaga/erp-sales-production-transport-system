// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("access")
      ? {
          access: localStorage.getItem("access"),
          refresh: localStorage.getItem("refresh"),
        }
      : null
  );
  const [user, setUser] = useState(() =>
    localStorage.getItem("access")
      ? jwtDecode(localStorage.getItem("access"))
      : null
  );

  // ✅ LOGIN USER
  const loginUser = async (username, password) => {
    const res = await API.post("token/", { username, password });
    const data = res.data;

    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    setAuthTokens({ access: data.access, refresh: data.refresh });
    setUser(data.user || jwtDecode(data.access));
  };

  // ✅ REGISTER USER
  const registerUser = async (registerData) => {
    const res = await API.post("accounts/register/", registerData);
    return res.data;
  };

  // ✅ LOGOUT USER
  const logoutUser = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setAuthTokens(null);
    setUser(null);
  };

  // ✅ AUTO TOKEN REFRESH
  const updateToken = async () => {
    if (!authTokens?.refresh) return;

    try {
      const res = await API.post("token/refresh/", {
        refresh: authTokens.refresh,
      });
      localStorage.setItem("access", res.data.access);
      setAuthTokens((prev) => ({ ...prev, access: res.data.access }));
      setUser(jwtDecode(res.data.access));
    } catch (error) {
      logoutUser();
    }
  };

  useEffect(() => {
    if (authTokens) {
      const interval = setInterval(() => updateToken(), 1000 * 60 * 10); // every 10 minutes
      return () => clearInterval(interval);
    }
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
