import React, { useState, useEffect, useRef } from "react";
import { Table, Input, Button, Space, notification, Modal } from "antd";
import { listInvoices, deleteInvoice } from "../api/api";
import InvoiceModal from "../modals/NewInvoiceModal";
import EditInvoiceModal from "../modals/EditInvoiceModal";
import { jwtDecode } from "jwt-decode";
import { useReactToPrint } from 'react-to-print';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [userName, setUserName] = useState("");

  const componentRef = useRef();

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

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice-${viewingInvoice?.invoice_number}`,
    onAfterPrint: () => setViewModalVisible(false),
  });

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
      render: text => <span>{text || 'N/A'}</span>,
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: text => <span>{text || 'N/A'}</span>,
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: text => <span>${text || '0.00'}</span>,
    },
    {
      title: "Tax Amount",
      dataIndex: "tax_amount",
      key: "tax_amount",
      render: text => <span>${text || '0.00'}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: text => <span>{text || 'Pending'}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEditInvoice(record)}>Edit</Button>
          <Button onClick={() => handleViewInvoice(record)}>View</Button>
          <Button danger onClick={() => handleDeleteInvoice(record)}>Delete</Button>
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
        footer={[
          <Button key="back" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
          <Button key="print" type="primary" onClick={handlePrint}>
            Export to PDF
          </Button>,
        ]}
      >
        <div ref={componentRef} style={{ padding: 20 }}>
          {viewingInvoice && (
            <div style={{ fontFamily: "Arial, sans-serif", color: "#555" }}>
              <h2 style={{ textAlign: "center" }}>Invoice</h2>
              <p><strong>Invoice Number:</strong> {viewingInvoice.invoice_number}</p>
              <p><strong>Issue Date:</strong> {viewingInvoice.issue_date}</p>
              <p><strong>Due Date:</strong> {viewingInvoice.due_date}</p>
              <p><strong>Total Amount:</strong> ${viewingInvoice.total_amount}</p>
              <p><strong>Tax Amount:</strong> ${viewingInvoice.tax_amount}</p>
              <p><strong>Status:</strong> {viewingInvoice.status}</p>
              <p><strong>Supplier Name:</strong> {viewingInvoice.supplier_name}</p>
              <p><strong>Supplier Address:</strong> {viewingInvoice.supplier_address}</p>
              <p><strong>Customer Name:</strong> {viewingInvoice.customer_name}</p>
              <p><strong>Customer Address:</strong> {viewingInvoice.customer_address}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Invoices;
