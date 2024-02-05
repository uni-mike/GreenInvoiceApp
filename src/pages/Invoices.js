import React, { useState, useEffect, useRef } from "react";
import { Table, Input, Button, Space, notification, Modal } from "antd";
import { listInvoices, deleteInvoice } from "../api/api";
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
    const html = await loadInvoiceTemplate(invoice);
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

    replacePlaceholders(
      /{{invoice.invoice_number}}/g,
      invoice.invoice_number || "None"
    );
    replacePlaceholders(
      /{{invoice.issue_date}}/g,
      invoice.issue_date
        ? new Date(invoice.issue_date).toLocaleDateString()
        : "None"
    );
    replacePlaceholders(
      /{{invoice.due_date}}/g,
      invoice.due_date
        ? new Date(invoice.due_date).toLocaleDateString()
        : "None"
    );
    replacePlaceholders(
      /{{invoice.total_amount}}/g,
      `${invoice.currency} ${formatCurrency(
        invoice.total_amount || 0,
        invoice.currency
      )}`
    );
    replacePlaceholders(
      /{{invoice.tax_amount}}/g,
      `${invoice.currency} ${formatCurrency(
        invoice.tax_amount || 0,
        invoice.currency
      )}`
    );
    replacePlaceholders(
      /{{invoice.supplier_name}}/g,
      invoice.supplier_name || "None"
    );
    replacePlaceholders(
      /{{invoice.supplier_address}}/g,
      invoice.supplier_address || "None"
    );
    replacePlaceholders(
      /{{invoice.customer_name}}/g,
      invoice.customer_name || "None"
    );
    replacePlaceholders(
      /{{invoice.customer_address}}/g,
      invoice.customer_address || "None"
    );
    replacePlaceholders(/{{invoice.currency}}/g, invoice.currency || "None");
    replacePlaceholders(
      /{{invoice.payment_terms}}/g,
      invoice.payment_terms || "None"
    );
    replacePlaceholders(
      /{{invoice.purchase_order_number}}/g,
      invoice.purchase_order_number || "None"
    );
    replacePlaceholders(
      /{{invoice.shipping_details}}/g,
      invoice.shipping_details || "None"
    );
    replacePlaceholders(
      /{{invoice.bank_details}}/g,
      invoice.bank_details || "None"
    );
    replacePlaceholders(
      /{{invoice.regulatory_information}}/g,
      invoice.regulatory_information || "None"
    );
    replacePlaceholders(/{{invoice.notes}}/g, invoice.notes || "None");

    const subtotal = parseFloat(invoice.total_amount) || 0;
    const taxRate = parseFloat(invoice.tax_amount || 0);
    const taxAmount = (subtotal * (taxRate / 100)).toFixed(2);
    const total = (parseFloat(subtotal) + parseFloat(taxAmount)).toFixed(2);

    replacePlaceholders(
      /<strong>Subtotal:<\/strong> None/g,
      `<strong>Subtotal:</strong> ${invoice.currency} ${formatCurrency(
        subtotal,
        invoice.currency
      )}`
    );
    replacePlaceholders(
      /<strong>Tax \(None%\):<\/strong> None/g,
      `<strong>Tax (${taxRate.toFixed(2)}%):</strong> ${
        invoice.currency
      } ${formatCurrency(taxAmount, invoice.currency)}`
    );
    replacePlaceholders(
      /<strong>Total:<\/strong> None/g,
      `<strong>Total:</strong> ${invoice.currency} ${formatCurrency(
        total,
        invoice.currency
      )}`
    );

    if (invoice.line_items && invoice.line_items.length > 0) {
      const lineItemsHtml = invoice.line_items
        .map(
          (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ccc;">
            ${item.description || "None"}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #ccc;">
            ${item.quantity || "None"}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #ccc;">
            ${invoice.currency} ${formatCurrency(
            item.price || 0,
            invoice.currency
          )}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #ccc;">
            ${invoice.currency} ${formatCurrency(
            (item.quantity || 0) * (item.price || 0),
            invoice.currency
          )}
          </td>
        </tr>
      `
        )
        .join("");
      html = html.replace(/<!-- Repeat for each item -->/g, lineItemsHtml);
    } else {
      html = html.replace(
        /<!-- Repeat for each item -->/g,
        "<tr><td colspan='4' style='text-align: center;'>No items</td></tr>"
      );
    }

    return html;
  };

  const formatCurrency = (value) => {
    if (typeof value === "number") {
      return `$${value.toFixed(2)}`;
    }
    return value;
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
