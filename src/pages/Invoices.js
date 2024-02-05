import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, notification, Modal } from "antd";
import { listInvoices, deleteInvoice } from "../api/api";
import InvoiceModal from "../modals/NewInvoiceModal";
import EditInvoiceModal from "../modals/EditInvoiceModal";
import { jwtDecode } from "jwt-decode";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
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
    const updatedInvoices = await listInvoices(token);
    setInvoices(updatedInvoices);
  };

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setEditModalVisible(true);
  };

  const handleViewInvoice = (invoice) => {
    setViewingInvoice(invoice);
    setViewModalVisible(true);
  };

  const handleDeleteInvoice = async (invoice) => {
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
          <Button onClick={() => handleViewInvoice(record)}>View</Button>
          <Button danger onClick={() => handleDeleteInvoice(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Welcome, {userName || "authenticated user"}</h2>
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
      <Modal
        title="Invoice Details"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
      >
        {viewingInvoice && (
          <div>
            <p>Invoice Number: {viewingInvoice.invoice_number}</p>
            <p>Issue Date: {viewingInvoice.issue_date}</p>
            <p>Due Date: {viewingInvoice.due_date}</p>
            <p>Total Amount: {viewingInvoice.total_amount}</p>
            <p>Tax Amount: {viewingInvoice.tax_amount}</p>
            <p>Status: {viewingInvoice.status}</p>
            <p>Supplier Name: {viewingInvoice.supplier_name}</p>
            <p>Supplier Address: {viewingInvoice.supplier_address}</p>
            <p>Customer Name: {viewingInvoice.customer_name}</p>
            <p>Customer Address: {viewingInvoice.customer_address}</p>
            <p>Currency: {viewingInvoice.currency}</p>
            <p>Payment Terms: {viewingInvoice.payment_terms}</p>
            <p>Purchase Order Number: {viewingInvoice.purchase_order_number}</p>
            <p>Shipping Details: {viewingInvoice.shipping_details}</p>
            <p>Bank Details: {viewingInvoice.bank_details}</p>
            <p>
              Regulatory Information: {viewingInvoice.regulatory_information}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Invoices;
