import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import { useAuth } from "./pages/AuthContext";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/welcome" element={<Welcome />} />
  <Route path="*" element={isAuthenticated ? <Navigate to="/welcome" /> : <Navigate to="/login" />} />
</Routes>

    </div>
  );
}

export default App;
