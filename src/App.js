import React, { useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Invoices from "./pages/Invoices";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import LineItems from "./pages/LineItems";

import { useAuth } from "./pages/AuthContext";
import { Layout, Menu } from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

function App() {
  const { isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {isAuthenticated && (
        <Sider collapsible collapsed={collapsed} onCollapse={toggleSidebar}>
          <div className="logo" />
          <Menu theme="dark" mode="vertical">
            <Menu.Item key="1" icon={<FileTextOutlined />}>
              <Link to="/invoices">Invoices</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<UserOutlined />}>
              <Link to="/suppliers">Suppliers</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<TeamOutlined />}>
              <Link to="/customers">Customers</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<SettingOutlined />}>
              <Link to="/settings">Settings</Link>
            </Menu.Item>
            <Menu.Item key="5" icon={<AppstoreAddOutlined />}>
              {" "}
              <Link to="/invoices/lineitems">Line Items</Link>
            </Menu.Item>
            <Menu.Item key="6" icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Menu.Item>
          </Menu>
        </Sider>
      )}
      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{ padding: 0 }}
        ></Header>
        <Content style={{ margin: "16px" }}>
          <div
            className="site-layout-background"
            style={{ padding: 24, minHeight: 360 }}
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/invoices/lineitems" element={<LineItems />} />{" "}
              <Route
                path="*"
                element={
                  isAuthenticated ? (
                    <Navigate to="/invoices" />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
