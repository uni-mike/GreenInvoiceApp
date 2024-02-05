import React, { useState } from "react";
import { Alert } from "antd";
import { useNavigate } from "react-router-dom";
import * as api from "../api/api";
import { useAuth } from "./AuthContext";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

const clientId =
  "835774101543-nbskjj7th3jc169u6g8gr28m8jss0h8p.apps.googleusercontent.com";

const Login = () => {
  const { setUser, setIsAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
  };

  const alertStyle = {
    marginBottom: "16px",
    width: "300px",
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);

      const response = await api.authenticateUser(credentialResponse);
      localStorage.setItem("token", response.token);

      setUser(response.user);
      setIsAuthenticated(true);
      navigate("/invoices");
      setError(null);
    } catch (error) {
      setError("Failed to log in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    setError("Google login failed. Please try again.");
  };

  return (
    <div style={containerStyle}>
      {error && (
        <Alert message={error} type="error" showIcon style={alertStyle} />
      )}
      <GoogleOAuthProvider clientId={clientId}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          render={(props) => (
            <button
              onClick={props.onClick}
              disabled={props.disabled}
              style={{ marginBottom: "20px" }}
            >
              Login with Google
            </button>
          )}
        />
      </GoogleOAuthProvider>
    </div>
  );
};

export default Login;
