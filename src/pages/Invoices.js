import React, { useState, useEffect, useRef } from "react";
import { Table, Input, Button, Space, notification, Modal } from "antd";
import { listInvoices, deleteInvoice, getLineItem } from "../api/api";

import InvoiceModal from "../modals/NewInvoiceModal";
import EditInvoiceModal from "../modals/EditInvoiceModal";
import { jwtDecode } from "jwt-decode";
import { useReactToPrint } from "react-to-print";

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
      setInvoices(data);
      console.log(data);
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
    const html = await loadInvoiceTemplate(invoice, lineItemsDetails);
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

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice-${viewingInvoice?.invoice_number}`,
    onAfterPrint: () => setViewModalVisible(false),
  });

  const loadInvoiceTemplate = async (invoice) => {
    const response = await fetch("/template/invoice.html");
    let html = await response.text();

    const replacePlaceholders = (placeholder, value) => {
      html = html.replace(new RegExp(placeholder, "g"), value);
    };

    replacePlaceholders("{{invoice_number}}", invoice.invoice_number || "None");
    replacePlaceholders(
      "{{issue_date}}",
      invoice.issue_date
        ? new Date(invoice.issue_date).toLocaleDateString()
        : "None"
    );
    replacePlaceholders(
      "{{due_date}}",
      invoice.due_date
        ? new Date(invoice.due_date).toLocaleDateString()
        : "None"
    );
    replacePlaceholders(
      "{{total_amount}}",
      `${invoice.currency} ${formatCurrency(
        invoice.total_amount || 0,
        invoice.currency
      )}`
    );
    replacePlaceholders(
      "{{tax_amount}}",
      `${invoice.currency} ${formatCurrency(
        invoice.tax_amount || 0,
        invoice.currency
      )}`
    );
    replacePlaceholders("{{supplier_name}}", invoice.supplier_name || "None");
    replacePlaceholders(
      "{{supplier_address}}",
      invoice.supplier_address || "None"
    );
    replacePlaceholders("{{customer_name}}", invoice.customer_name || "None");
    replacePlaceholders(
      "{{customer_address}}",
      invoice.customer_address || "None"
    );
    replacePlaceholders("{{currency}}", invoice.currency || "None");
    replacePlaceholders("{{payment_terms}}", invoice.payment_terms || "None");
    replacePlaceholders(
      "{{purchase_order_number}}",
      invoice.purchase_order_number || "None"
    );
    replacePlaceholders(
      "{{shipping_details}}",
      invoice.shipping_details || "None"
    );
    replacePlaceholders("{{bank_details}}", invoice.bank_details || "None");
    replacePlaceholders(
      "{{regulatory_information}}",
      invoice.regulatory_information || "None"
    );
    replacePlaceholders("{{notes}}", invoice.notes || "None");

    const lineItemsHtml = invoice.line_items
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ccc;">${
          item.description || "None"
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #ccc;">${
          item.quantity || "None"
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #ccc;">${
          invoice.currency
        } ${formatCurrency(item.price || 0, invoice.currency)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ccc;">${
          invoice.currency
        } ${formatCurrency(
          (item.quantity || 0) * (item.price || 0),
          invoice.currency
        )}</td>
      </tr>
    `
      )
      .join("");

    html = html.replace("<!-- Repeat for each item -->", lineItemsHtml);

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
          {record.tax_rate
            ? `${record.tax_rate.toFixed(2)}% ${formatCurrency(
                text || 0,
                record.currency
              )}`
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

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoice_number.includes(searchText)
  );

  return (
    <div>
      <h2>Welcome, {userName}</h2>
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
        onCreate={refreshInvoiceList}
        token={localStorage.getItem("token")}
      />
      {editModalVisible && selectedInvoice && (
        <EditInvoiceModal
          visible={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          invoiceData={selectedInvoice}
          onUpdate={refreshInvoiceList}
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
        <div
          ref={componentRef}
          dangerouslySetInnerHTML={{ __html: invoiceHtml }}
          style={{ overflowY: "scroll", maxHeight: "70vh" }}
        />
      </Modal>
    </div>
  );
};

export default Invoices;
