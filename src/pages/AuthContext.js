import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import * as jwt_decode from "jwt-decode";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({ username: null, user_id: null });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwt_decode(token);
        if (decoded.username) {
          setUser({ username: decoded.username, user_id: decoded.user_id });
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
    } finally {
      setLoaded(true);
    }
  }, []);

  const contextValue = useMemo(() => ({
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
    loaded,
  }), [isAuthenticated, user, loaded]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
