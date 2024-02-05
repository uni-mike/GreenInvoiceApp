import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, notification } from "antd";
import { listInvoices, deleteInvoice } from "../api/api";
import InvoiceModal from "../modals/NewInvoiceModal";
import EditInvoiceModal from "../modals/EditInvoiceModal";
import { jwtDecode } from "jwt-decode";

const Welcome = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.user_name || "authenticated user");
      } catch (error) {
        console.error("Error decoding token:", error);
        setUserName("authenticated user");
      }
    }

    const fetchInvoices = async () => {
      try {
        const data = await listInvoices(token);
        setInvoices(data);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      }
    };

    fetchInvoices();
  }, []);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleCreateInvoice = () => {
    setModalVisible(true);
  };

  const refreshInvoiceList = async () => {
    const token = localStorage.getItem("token");
    await new Promise((resolve) => setTimeout(resolve, 100));
    const updatedInvoices = await listInvoices(token);
    setInvoices(updatedInvoices);
  };

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setEditModalVisible(true);
  };

  const handleDeleteInvoice = async (invoice) => {
    try {
      const confirmMessage = `Are you sure you want to delete invoice ${invoice.invoice_number}?`;
      if (window.confirm(confirmMessage)) {
        const token = localStorage.getItem("token");
        await deleteInvoice(token, invoice.id);
        notification.success({
          message: "Invoice Deleted",
          description: `Invoice ${invoice.invoice_number} has been deleted successfully.`,
        });
        refreshInvoiceList();
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      notification.error({
        message: "Delete Invoice Failed",
        description: "Failed to delete the invoice. Please try again.",
      });
    }
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
      title: "Tax Amount",
      dataIndex: "tax_amount",
      key: "tax_amount",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEditInvoice(record)}>
            Edit
          </Button>
          <Button type="danger" onClick={() => handleDeleteInvoice(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Welcome, {userName || "authenticated user"}!</h2>{" "}
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
        token={localStorage.getItem("token")}
      />
      {editModalVisible && selectedInvoice && (
        <EditInvoiceModal
          visible={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          invoiceData={selectedInvoice}
          onUpdate={() => {
            setEditModalVisible(false);
            refreshInvoiceList();
          }}
        />
      )}
    </div>
  );
};

export default Welcome;
