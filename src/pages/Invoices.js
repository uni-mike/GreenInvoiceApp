import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  notification,
  Modal,
  Tooltip,
} from "antd";

import {
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  PrinterOutlined,
  MailOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import {
  listInvoices,
  deleteInvoice,
  getLineItem,
  sendInvoiceEmail,
  updateInvoice,
  fetchExportedInvoices,
} from "../api/api";

import InvoiceModal from "../modals/NewInvoiceModal";
import EditInvoiceModal from "../modals/EditInvoiceModal";
import jwtDecode from "jwt-decode";
import { nanoid } from "nanoid";
import { convertToCSV } from "../utils/csvUtils";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [userName, setUserName] = useState("");
  const [invoiceHtml, setInvoiceHtml] = useState("");

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

    fetchInvoices(token);
  }, []);

  const fetchInvoices = async (token) => {
    try {
      const data = await listInvoices(token);
      const dataWithUniqueKeys = data.map((record) => ({
        ...record,
        key: nanoid(),
      }));

      setInvoices(dataWithUniqueKeys);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  };

  const handleSearch = (e) => setSearchText(e.target.value);
  const handleCreateInvoice = () => setModalVisible(true);
  const refreshInvoiceList = () => fetchInvoices(localStorage.getItem("token"));

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setEditModalVisible(true);
  };

  const handleViewInvoice = async (invoice) => {
    setViewingInvoice(invoice);
    const token = localStorage.getItem("token");
    const lineItemsDetailsPromises = invoice.line_items.map((lineItem) =>
      getLineItem(token, lineItem.id)
    );
    const lineItemsDetails = await Promise.all(lineItemsDetailsPromises);

    const lineItemsWithUniqueIds = lineItemsDetails.map((item) => ({
      ...item,
      id: nanoid(),
    }));

    const html = await loadInvoiceTemplate(invoice, lineItemsWithUniqueIds);
    setInvoiceHtml(html);
    setViewModalVisible(true);
  };

  const handleDeleteInvoice = async (invoice) => {
    const confirmMessage = `Are you sure you want to delete invoice ${invoice.invoice_number}?`;
    if (window.confirm(confirmMessage)) {
      await deleteInvoice(localStorage.getItem("token"), invoice.id);
      notification.success({
        message: "Invoice Deleted",
        description: `Invoice ${invoice.invoice_number} has been deleted successfully.`,
      });
      refreshInvoiceList();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "");
    printWindow.document.open();
    printWindow.document.write(`
      <html>
      <head>
        <style>
          @media print {
            body {
              font-size: 12px;
              line-height: 1.2;
            }
          }
        </style>
      </head>
      <body>
        ${invoiceHtml}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const handleSendInvoiceEmail = async () => {
    try {
      const email = await prompt(
        "Please enter the email address to send the invoice to:"
      );
      if (email === null) return;

      const response = await sendInvoiceEmail(
        localStorage.getItem("token"),
        viewingInvoice.id,
        email
      );
      if (response && response.message === "Invoice email sent successfully") {
        await updateInvoice(localStorage.getItem("token"), viewingInvoice.id, {
          status: "Sent",
        });
        notification.success({
          message: "Email Sent",
          description: "The invoice has been successfully emailed.",
        });
      } else {
        throw new Error(
          "Failed to send email. Unexpected response from the server."
        );
      }
    } catch (error) {
      notification.error({
        message: "Failed to Send Email",
        description: error.message || "Please try again later.",
      });
    }
  };

  const loadInvoiceTemplate = async (invoice, lineItemsDetails) => {
    const response = await fetch("./template/invoice.html");
    let html = await response.text();

    const replacePlaceholder = (placeholder, value) => {
      html = html.replace(new RegExp(`{{${placeholder}}}`, "g"), value);
    };

    replacePlaceholder("invoice_number", invoice.invoice_number);
    replacePlaceholder(
      "issue_date",
      new Date(invoice.issue_date).toLocaleDateString()
    );
    replacePlaceholder(
      "due_date",
      new Date(invoice.due_date).toLocaleDateString()
    );
    replacePlaceholder("customer_name", invoice.customer_name);
    replacePlaceholder("customer_address", invoice.customer_address);
    replacePlaceholder("supplier_name", invoice.supplier_name);
    replacePlaceholder("supplier_address", invoice.supplier_address);
    replacePlaceholder("payment_terms", invoice.payment_terms);
    replacePlaceholder(
      "purchase_order_number",
      invoice.purchase_order_number || "N/A"
    );
    replacePlaceholder("shipping_details", invoice.shipping_details || "N/A");
    replacePlaceholder("bank_details", invoice.bank_details || "N/A");
    replacePlaceholder(
      "regulatory_information",
      invoice.regulatory_information || "N/A"
    );
    replacePlaceholder("notes", invoice.notes || "N/A");

    let subtotal = 0;
    const lineItemsHtml = lineItemsDetails
      .map((item) => {
        let lineTotal = item.quantity * parseFloat(item.price);
        subtotal += lineTotal;
        return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ccc;">${
            item.name || "N/A"
          }</td>
          <td style="padding: 8px; border-bottom: 1px solid #ccc;">${
            item.quantity
          }</td>
          <td style="padding: 8px; border-bottom: 1px solid #ccc;">${
            invoice.currency
          } ${parseFloat(item.price).toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ccc;">${
            invoice.currency
          } ${lineTotal.toFixed(2)}</td>
        </tr>
      `;
      })
      .join("");

    let tax = parseFloat(invoice.tax_amount);
    let total = parseFloat(invoice.total_amount);

    if (!isNaN(tax) && !isNaN(total)) {
      replacePlaceholder("tax", `USD ${tax.toFixed(2)}`);
      replacePlaceholder("total", `USD ${total.toFixed(2)}`);
      replacePlaceholder("subtotal", `USD ${subtotal.toFixed(2)}`);
    } else {
      replacePlaceholder("tax", "USD N/A");
      replacePlaceholder("total", "USD N/A");
    }

    html = html.replace(
      /<tbody>[\s\S]*?<\/tbody>/,
      `<tbody>${lineItemsHtml}</tbody>`
    );

    return html;
  };

  const formatCurrency = (value, currency) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    });
    return formatter.format(value);
  };

  const handleExportToCSV = async () => {
    try {
      const exportedData = await fetchExportedInvoices(
        localStorage.getItem("token")
      );
      const csvData = convertToCSV(exportedData);

      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.setAttribute("href", URL.createObjectURL(blob));
      link.setAttribute("download", "invoices.csv");

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to export invoices:", error);
    }
  };
  

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
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditInvoice(record)}
              type="primary"
            />
          </Tooltip>
          <Tooltip title="View">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewInvoice(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteInvoice(record)}
              danger
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoice_number.includes(searchText)
  );

  return (
    <div>
      <Input
        placeholder="Search Invoices by Number"
        value={searchText}
        onChange={handleSearch}
        style={{ width: 200, marginBottom: 20 }}
      />
      <Button
        type="primary"
        style={{ marginBottom: 20, marginLeft: 10 }}
        onClick={handleCreateInvoice}
      >
        Issue New Invoice
      </Button>
      <Button
        type="primary"
        style={{ marginBottom: 20, marginLeft: 10 }}
        onClick={handleExportToCSV}
      >
        Export
      </Button>

      <Table columns={columns} dataSource={filteredInvoices} rowKey="key" />
      <InvoiceModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onCreate={refreshInvoiceList}
        token={localStorage.getItem("token")}
      />
      {editModalVisible && selectedInvoice && (
        <EditInvoiceModal
          visible={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          invoiceData={selectedInvoice}
          onUpdate={refreshInvoiceList}
          token={localStorage.getItem("token")}
        />
      )}

      <Modal
        title="Invoice Details"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        width={650}
        footer={[
          <Tooltip title="Close" key={nanoid()}>
            <Button
              icon={<CloseOutlined />}
              onClick={() => setViewModalVisible(false)}
            />
          </Tooltip>,
          <Tooltip title="Print" key={nanoid()}>
            <Button
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              type="primary"
            />
          </Tooltip>,
          <Tooltip title="Email Invoice" key={nanoid()}>
            <Button
              icon={<MailOutlined />}
              onClick={handleSendInvoiceEmail}
              type="primary"
            />
          </Tooltip>,
        ]}
      >
        <div
          ref={componentRef}
          dangerouslySetInnerHTML={{ __html: invoiceHtml }}
          style={{ overflowY: "scroll", maxHeight: "70vh", padding: "0 20px" }}
        />
      </Modal>
    </div>
  );
};

export default Invoices;
