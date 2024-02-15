import React, { useState, useEffect } from "react";
import { List, Typography } from "antd";

const TaxAdvisorInvoices = () => {
  const [invoices, setInvoices] = useState([
    { id: 1, number: "INV-001", totalAmount: 100 },
    { id: 2, number: "INV-002", totalAmount: 150 },
    { id: 3, number: "INV-003", totalAmount: 200 },
  ]);

  return (
    <div>
      <Typography.Title level={2}>Tax Advisor Invoices</Typography.Title>
      <List
        bordered
        dataSource={invoices}
        renderItem={(item) => (
          <List.Item>
            <Typography.Text strong>{item.number}</Typography.Text> - Total
            Amount: ${item.totalAmount}
          </List.Item>
        )}
      />
    </div>
  );
};

export default TaxAdvisorInvoices;
