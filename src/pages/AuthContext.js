import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import jwtDecode from "jwt-decode";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({ username: null, user_id: null });
  const [tempUserData, setTempUserData] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.user_id) {
          setUser({ user_id: decoded.user_id, username: decoded.username });
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setLoaded(true);
  }, [token]);

  const saveToken = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser({ username: null, user_id: null });
    setToken(null);
    setTempUserData(null);
  };

  const requireOtpValidation = (userData) => {
    setTempUserData(userData);
  };

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      user,
      token,
      tempUserData,
      saveToken,
      logout,
      requireOtpValidation,
      loaded,
      setUser,
      setIsAuthenticated,
      setToken,
    }),
    [isAuthenticated, user, token, tempUserData, loaded]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
