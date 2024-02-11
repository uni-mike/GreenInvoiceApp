import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Invoices from "./pages/Invoices";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import LineItems from "./pages/LineItems";
import Dashboard from "./pages/Dashboard";

import { useAuth } from "./pages/AuthContext";
import { Button, Layout, Menu } from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  AppstoreAddOutlined,
  DashboardOutlined,
  MenuOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

function App() {
  const { isAuthenticated, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768); // Adjust this value according to your breakpoint
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuVisible(!isMobileMenuVisible);
  };

  const handleMenuItemClick = () => {
    setIsMobileMenuVisible(false);
  };

  const handleLogout = () => {
    logout();
    setCollapsed(false);
    setIsMobileMenuVisible(false);
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {isAuthenticated && (
        <>
          {isSmallScreen && ( // Render mobile menu button only on small screens
            <div className="mobile-menu-button">
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => toggleMobileMenu()}
              />
            </div>
          )}
          {/* Mobile menu */}
          {isMobileMenuVisible && isSmallScreen && (
            <div className="mobile-menu">
              <Menu
                theme="light"
                mode="vertical"
                onClick={handleMenuItemClick} // Close mobile menu on item click
              >
                <Menu.Item key="1" icon={<DashboardOutlined />}>
                  <Link to="/dashboard">Dashboard</Link>
                </Menu.Item>
                <Menu.Item key="2" icon={<FileTextOutlined />}>
                  <Link to="/invoices">Invoices</Link>
                </Menu.Item>
                <Menu.Item key="3" icon={<UserOutlined />}>
                  <Link to="/suppliers">Suppliers</Link>
                </Menu.Item>
                <Menu.Item key="4" icon={<TeamOutlined />}>
                  <Link to="/customers">Customers</Link>
                </Menu.Item>
                <Menu.Item key="5" icon={<AppstoreAddOutlined />}>
                  <Link to="/invoices/lineitems">Line Items</Link>
                </Menu.Item>
                <Menu.Item key="6" icon={<SettingOutlined />}>
                  <Link to="/settings">Settings</Link>
                </Menu.Item>
                <Menu.Item
                  key="7"
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu>
            </div>
          )}
          {/* Desktop sidebar */}
          {!isSmallScreen && (
            <Sider
              collapsible
              collapsed={collapsed}
              onCollapse={toggleSidebar}
              theme="light"
            >
              <div className="logo" />
              <Menu theme="light" mode="vertical">
                <Menu.Item key="1" icon={<DashboardOutlined />}>
                  <Link to="/dashboard">Dashboard</Link>
                </Menu.Item>
                <Menu.Item key="2" icon={<FileTextOutlined />}>
                  <Link to="/invoices">Invoices</Link>
                </Menu.Item>
                <Menu.Item key="3" icon={<UserOutlined />}>
                  <Link to="/suppliers">Suppliers</Link>
                </Menu.Item>
                <Menu.Item key="4" icon={<TeamOutlined />}>
                  <Link to="/customers">Customers</Link>
                </Menu.Item>
                <Menu.Item key="5" icon={<AppstoreAddOutlined />}>
                  <Link to="/invoices/lineitems">Line Items</Link>
                </Menu.Item>
                <Menu.Item key="6" icon={<SettingOutlined />}>
                  <Link to="/settings">Settings</Link>
                </Menu.Item>
                <Menu.Item
                  key="7"
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu>
            </Sider>
          )}
        </>
      )}
      <Layout className="site-layout" style={{ backgroundColor: "#fff" }}>
        <Content style={{ margin: "16px", backgroundColor: "#fff" }}>
          <div
            className="site-layout-background"
            style={{ padding: 24, minHeight: 360, backgroundColor: "#fff" }}
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/invoices/lineitems" element={<LineItems />} />
              <Route
                path="*"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" />
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
