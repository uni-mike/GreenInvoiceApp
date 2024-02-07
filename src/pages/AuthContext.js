import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { jwtDecode } from "jwt-decode"; // Correct import assuming jwt-decode is the package name

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({ username: null, user_id: null });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.user_id) {
          setUser({ user_id: decoded.user_id, username: decoded.username }); // Assuming username is part of the token
          setIsAuthenticated(true);
        } else {
          console.error("Invalid token");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setLoaded(true);
  }, [token]); // Listen to token changes instead of isAuthenticated to avoid unnecessary effects

  const saveToken = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser({ username: null, user_id: null });
    setToken(null); // Clear the token state
  };

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      setIsAuthenticated,
      user,
      setUser,
      token,
      saveToken,
      logout, // Include logout in the context
      loaded,
    }),
    [isAuthenticated, user, token, loaded]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
