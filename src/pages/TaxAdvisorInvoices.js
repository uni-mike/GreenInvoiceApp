import React, { useState, useEffect } from "react";
import { Table, Typography, Button, Modal, Tooltip, Space } from "antd";
import { EyeOutlined, CloseOutlined } from "@ant-design/icons";
import { getInvoicesForTaxAdvisor } from "../api/api";
import { nanoid } from "nanoid";

const TaxAdvisorInvoices = ({ userId }) => {
  const [invoices, setInvoices] = useState([]);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem("token");
        // Check if userId is not null before making the API call
        if (userId !== null) {
          const data = await getInvoicesForTaxAdvisor(token, userId);
          setInvoices(data);
        }
      } catch (error) {
        console.error("Error fetching invoices for tax advisor:", error);
      }
    };

    fetchInvoices();
  }, [userId]);

  const columns = [
    {
      title: "Invoice Number",
      dataIndex: "invoice_number",
      key: "invoice_number",
    },
    {
      title: "Invoice Type",
      dataIndex: "invoice_type",
      key: "invoice_type",
    },
    {
      title: "Issue Date",
      dataIndex: "issue_date",
      key: "issue_date",
      render: (text) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (text) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (text, record) => (
        <span>
          {`${record.currency} ${formatCurrency(text || 0, record.currency)}`}
        </span>
      ),
    },
    {
      title: "Tax Amount",
      dataIndex: "tax_amount",
      key: "tax_amount",
      render: (text, record) => (
        <span>
          {record.tax_amount
            ? `${formatCurrency(text || 0, record.currency)}`
            : `N/A`}
        </span>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customer_name",
      key: "customer_name",
      render: (text) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => <span>{text || "Pending"}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewInvoice(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const formatCurrency = (value, currency) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    });
    return formatter.format(value);
  };

  const handleViewInvoice = (invoice) => {
    setViewingInvoice(invoice);
    setViewModalVisible(true);
  };

  const handleCloseViewModal = () => {
    setViewingInvoice(null);
    setViewModalVisible(false);
  };

  return (
    <div>
      <Typography.Title level={2}>Tax Advisor Invoices</Typography.Title>
      <Table columns={columns} dataSource={invoices} rowKey="id" />

      <Modal
        title="Invoice Details"
        visible={viewModalVisible}
        onCancel={handleCloseViewModal}
        footer={[
          <Button key="close" onClick={handleCloseViewModal}>
            Close
          </Button>,
        ]}
        style={{ maxHeight: "70vh" }} // Add this style to limit the modal's height
      >
        <div style={{ overflowY: "auto", padding: "0 20px" }}>
          {" "}
          {/* Change overflowY to auto */}
          <p>Invoice Number: {viewingInvoice?.invoice_number}</p>
          <p>Invoice Type: {viewingInvoice?.invoice_type}</p>
          <p>Issue Date: {viewingInvoice?.issue_date}</p>
          <p>Due Date: {viewingInvoice?.due_date}</p>
          <p>
            Total Amount: {viewingInvoice?.currency}{" "}
            {viewingInvoice?.total_amount}
          </p>
          <p>
            Tax Amount: {viewingInvoice?.currency} {viewingInvoice?.tax_amount}
          </p>
          <p>Customer: {viewingInvoice?.customer_name}</p>
          <p>Status: {viewingInvoice?.status}</p>
          {/* Render line items */}
          {viewingInvoice?.line_items &&
            viewingInvoice?.line_items.length > 0 && (
              <div>
                <p>
                  <strong>Line Items:</strong>
                </p>
                <ul>
                  {viewingInvoice?.line_items.map((item) => (
                    <li key={item.id}>
                      {item.name} - Quantity: {item.quantity}, Price:{" "}
                      {viewingInvoice?.currency} {item.price}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      </Modal>
    </div>
  );
};

export default TaxAdvisorInvoices;
