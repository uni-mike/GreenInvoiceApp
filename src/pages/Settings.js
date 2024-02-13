import React, { useState, useEffect } from "react";
import { Input, Button, notification, Spin } from "antd";
import { updateUser, listUsers } from "../api/api";
import jwtDecode from "jwt-decode";

const SettingsPage = () => {
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.user_id;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [taxDownPaymentPercentage, setTaxDownPaymentPercentage] = useState("");
  const [monthlySocialSecurityPayment, setMonthlySocialSecurityPayment] =
    useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const userData = await listUsers(token, { user_id: userId });
        const {
          name,
          email,
          tax_down_payment_percentage,
          monthly_social_security_payment,
        } = userData[0];
        setName(name);
        setEmail(email);
        setTaxDownPaymentPercentage(tax_down_payment_percentage.toString());
        setMonthlySocialSecurityPayment(
          monthly_social_security_payment.toString()
        );
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
      setLoading(false);
    };

    fetchSettings();
  }, [token, userId]);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const updateData = {
        tax_down_payment_percentage: parseFloat(taxDownPaymentPercentage),
        monthly_social_security_payment: parseFloat(
          monthlySocialSecurityPayment
        ),
      };
      await updateUser(token, userId, updateData);
      notification.success({
        message: "Settings Updated",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update settings:", error);
      notification.error({
        message: "Update Failed",
        description: "Failed to update settings. Please try again later.",
      });
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Settings</h1>
      <Spin spinning={loading} tip="Loading...">
        <label htmlFor="name">Name:</label>
        <Input
          id="name"
          value={name}
          readOnly
          style={{ marginBottom: 20, width: "100%" }}
        />
        <label htmlFor="email">Email:</label>
        <Input
          id="email"
          value={email}
          readOnly
          style={{ marginBottom: 20, width: "100%" }}
        />
        <label htmlFor="taxPercentage">Tax Down Payment Percentage:</label>
        <Input
          id="taxPercentage"
          value={taxDownPaymentPercentage}
          onChange={(e) => setTaxDownPaymentPercentage(e.target.value)}
          style={{ marginBottom: 20, width: "100%" }}
        />
        <label htmlFor="socialSecurity">Monthly Social Security Payment:</label>
        <Input
          id="socialSecurity"
          value={monthlySocialSecurityPayment}
          onChange={(e) => setMonthlySocialSecurityPayment(e.target.value)}
          style={{ marginBottom: 20, width: "100%" }}
        />
        <Button
          type="primary"
          onClick={handleSaveSettings}
          loading={loading}
          style={{ width: "100%" }}
        >
          Save Settings
        </Button>
      </Spin>
    </div>
  );
};

export default SettingsPage;
