import React, { useState, useEffect } from "react";
import {
  Table,
  Typography,
  Button,
  Modal,
  Tooltip,
  Space,
  Spin,
  Select,
} from "antd";
import { EyeOutlined, DownloadOutlined } from "@ant-design/icons";
import { getInvoicesForTaxAdvisor, listUsers } from "../api/api";
import { convertToCSV } from "../utils/csvUtils";

const { Option } = Select;

const TaxAdvisorInvoices = ({ userId }) => {
  const [invoices, setInvoices] = useState([]);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userEmails, setUserEmails] = useState({});
  const [filteredCustomerId, setFilteredCustomerId] = useState(null);
  const [customerEmails, setCustomerEmails] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (userId !== null) {
          const data = await getInvoicesForTaxAdvisor(token, userId);
          setInvoices(data);
          const customerIds = [
            ...new Set(data.map((invoice) => invoice.user_id)),
          ];
          const promises = customerIds.map((customerId) =>
            listUsers(token, { user_id: customerId })
          );
          const userDataArray = await Promise.all(promises);
          const userEmailMap = {};
          userDataArray.forEach((userData, index) => {
            const customerId = customerIds[index];
            if (Array.isArray(userData) && userData.length > 0) {
              const user = userData[0];
              userEmailMap[customerId] = user.email;
            }
          });
          setUserEmails(userEmailMap);
          setCustomerEmails(Object.values(userEmailMap));
        }
      } catch (error) {
        console.error("Error fetching invoices for tax advisor:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId !== null) {
      fetchInvoices();
    }
  }, [userId]);

  const formatCurrency = (value, currency) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    });
    return formatter.format(value);
  };

  const columns = [
    {
      title: "Customer Email",
      dataIndex: "user_id",
      key: "user_id",
      render: (customerId) => userEmails[customerId] || "N/A",
    },
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

  const handleViewInvoice = (invoice) => {
    setViewingInvoice(invoice);
    setViewModalVisible(true);
  };

  const handleCloseViewModal = () => {
    setViewingInvoice(null);
    setViewModalVisible(false);
  };

  const handleCustomerFilterChange = (customerId) => {
    setFilteredCustomerId(customerId);
  };

  const handleExportToCSV = () => {
    let dataToExport = invoices;
    if (filteredCustomerId) {
      dataToExport = invoices.filter(
        (invoice) => invoice.user_id === filteredCustomerId
      );
    }

    dataToExport.forEach((invoice) => {
      invoice.total_amount = parseFloat(invoice.total_amount);
      invoice.tax_amount = parseFloat(invoice.tax_amount);
    });

    const csvContent = convertToCSV(dataToExport);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "invoices.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <Typography.Title level={2}>Shared with me</Typography.Title>
      <Space>
        <Select
          style={{ width: 200 }}
          placeholder="Filter by Customer Email"
          onChange={handleCustomerFilterChange}
        >
          {customerEmails.map((email) => (
            <Option key={email} value={email}>
              {email}
            </Option>
          ))}
        </Select>
        <Tooltip title="Export to CSV">
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportToCSV}
          >
            Export to CSV
          </Button>
        </Tooltip>
      </Space>
      {loading ? (
        <Spin tip="Loading...">
          <Table columns={columns} dataSource={invoices} rowKey="id" />
        </Spin>
      ) : (
        <Table columns={columns} dataSource={invoices} rowKey="id" />
      )}

      <Modal
        title="Invoice Details"
        visible={viewModalVisible}
        onCancel={handleCloseViewModal}
        footer={[
          <Button key="close" onClick={handleCloseViewModal}>
            Close
          </Button>,
        ]}
        style={{ maxHeight: "70vh" }}
      >
        <div style={{ overflowY: "auto", padding: "0 20px" }}>
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
