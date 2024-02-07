import React, { useState } from "react";
import { Alert, Input, Button } from "antd";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import * as api from "../api/api";
import { useAuth } from "./AuthContext";

const clientId =
  "835774101543-nbskjj7th3jc169u6g8gr28m8jss0h8p.apps.googleusercontent.com";

const Login = () => {
  const authContext = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempUserData, setTempUserData] = useState({});
  const [credentialResponse, setCredentialResponse] = useState(null); // Define state variable for credentialResponse

  const handleGoogleSuccess = async (response) => {
    // Renamed parameter to response
    setLoading(true);
    setError(null);
    setCredentialResponse(response); // Store credentialResponse in state

    try {
      const authData = {
        credential: response.credential,
        otp: otp,
      };

      const authResponse = await api.authenticateUser(authData);

      if (authResponse.token) {
        localStorage.setItem("token", authResponse.token);
        handleAuthenticationSuccess(authResponse);
      } else {
        if (authResponse.needOtpValidation) {
          setOtpRequired(true);
          setTempUserData({
            email: authResponse.email,
            google_id: authResponse.google_id,
            name: authResponse.name,
          });

          if (otp) {
            await handleRetryAuthentication(otp, response); // Pass credentialResponse here
          }
        } else {
          setError("Failed to log in with Google.");
        }
      }
    } catch (error) {
      console.error("Error during Google authentication:", error);
      setError("Failed to log in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetryAuthentication = async (otp, credentialResponse) => {
    try {
      console.log("Retrying authentication...");
      const response = await api.authenticateUser({
        credential: credentialResponse.credential,
        otp: otp,
      });

      console.log("Retry authentication response:", response);

      if (response.token) {
        console.log("User authenticated successfully after retry.");
        handleAuthenticationSuccess(response);
      } else {
        // Handle other scenarios such as OTP validation required or other errors
        if (response.needOtpValidation) {
          console.log("Retry authentication failed. OTP is still required.");
          setError("OTP is still required."); // Set error message for OTP requirement
        } else {
          setError("Failed to log in with Google after retry."); // Set error message for other errors
        }
      }
    } catch (error) {
      console.error("Error during retry authentication:", error);
      setError("Failed to log in with Google after retry.");
    }
  };

  const handleAuthenticationSuccess = (response) => {
    const { userData, token } = response;
    if (token) {
      localStorage.setItem("token", token);
    }

    authContext.setUser({
      username: userData.name,
      user_id: userData.google_id,
    });
    authContext.setIsAuthenticated(true);
    navigate("/invoices");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
      }}
    >
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: "16px", width: "300px" }}
        />
      )}
      {otpRequired ? (
        <>
          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ width: 200, marginBottom: "16px" }}
          />
          <Button
            type="primary"
            onClick={() => handleRetryAuthentication(otp, credentialResponse)} // Pass credentialResponse here
            loading={loading}
          >
            Retry Authentication with OTP
          </Button>
        </>
      ) : (
        <GoogleOAuthProvider clientId={clientId}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onFailure={(error) => {
              if (error && error.response && error.response.status === 400) {
                setOtpRequired(true);
              } else {
                setError("Google login failed. Please try again.");
              }
            }}
          />
        </GoogleOAuthProvider>
      )}
    </div>
  );
};

export default Login;
