import React, { useState, useEffect } from "react";
import { Table, Input } from "antd";
import { listInvoices } from "../api/api";

const Welcome = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchText, setSearchText] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await listInvoices(token);
        console.log("invoices_data:", data)
        setInvoices(data);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      }
    };

    fetchInvoices();
  }, [token]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoice_number.includes(searchText)
  );

  const columns = [
    {
      title: "Invoice Number",
      dataIndex: "invoice_number",
      key: "invoice_number",
    },
    {
      title: "Issue Date",
      dataIndex: "issue_date",
      key: "issue_date",
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    // Add more columns as needed
  ];

  return (
    <div>
      <h2>Welcome, authenticated user!</h2>
      <Input
        placeholder="Search Invoices by Number"
        value={searchText}
        onChange={handleSearch}
        style={{ width: 200, marginBottom: 20 }}
      />
      <Table columns={columns} dataSource={filteredInvoices} rowKey="id" />
    </div>
  );
};

export default Welcome;
