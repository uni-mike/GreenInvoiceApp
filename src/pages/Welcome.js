import React, { useState, useEffect } from "react";
import { Table, Input, Button } from "antd";
import { listInvoices } from "../api/api";
import InvoiceModal from "../modals/InvoiceModal";

const Welcome = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await listInvoices(token);
        console.log("invoices_data:", data);
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

  const handleCreateInvoice = () => {
    setModalVisible(true);
  };

  const refreshInvoiceList = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Adjust the delay as needed
    const updatedInvoices = await listInvoices(token); // Fetch the updated list of invoices
    setInvoices(updatedInvoices);
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
      <Button
        type="primary"
        style={{ marginBottom: 20 }}
        onClick={handleCreateInvoice}
      >
        Issue New Invoice
      </Button>
      <Table columns={columns} dataSource={filteredInvoices} rowKey="id" />
      <InvoiceModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onCreate={() => {
          setModalVisible(false);
          refreshInvoiceList();
        }}
        token={token}
      />
    </div>
  );
};

export default Welcome;
