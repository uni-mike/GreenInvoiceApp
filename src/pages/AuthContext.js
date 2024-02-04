import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { jwtDecode } from "jwt-decode";
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
          setUser({ user_id: decoded.user_id });

          setIsAuthenticated(true);
          console.log("isAuthenticated:", isAuthenticated);
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
  }, [isAuthenticated]);

  const saveToken = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      setIsAuthenticated,
      user,
      setUser,
      token,
      saveToken,
      loaded,
    }),
    [isAuthenticated, user, token, loaded]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
