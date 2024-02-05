import React from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  notification,
  DatePicker,
  InputNumber,
  Select,
} from "antd";
import { createInvoice } from "../api/api";

const { Option } = Select;

const InvoiceModal = ({ visible, onCancel, onCreate, token }) => {
  const [form] = Form.useForm();

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      console.log("Token in modal: ", token);
      const response = await createInvoice(values, token);
      if (response.invoice_id !== undefined) {
        notification.success({
          message: "Invoice Created",
          description: "The invoice has been created successfully.",
        });
        onCreate();
      } else {
        notification.error({
          message: "Invoice Creation Failed",
          description: "Failed to create the invoice. Please try again.",
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        notification.error({
          message: "Unauthorized",
          description: "You are not authenticated. Please log in.",
        });
      } else {
        console.error("Error creating invoice:", error);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      title="Create New Invoice"
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="create" type="primary" onClick={handleCreate}>
          Create
        </Button>,
      ]}
    >
      <Form form={form} name="createInvoiceForm">
        <Form.Item
          name="invoice_number"
          label="Invoice Number"
          rules={[
            {
              required: true,
              message: "Please enter the invoice number",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="total_amount"
          label="Total Amount"
          rules={[
            {
              required: true,
              type: "number",
              min: 0,
              message: "Please enter a valid total amount",
            },
          ]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="tax_amount"
          label="Tax Amount"
          rules={[
            {
              type: "number",
              min: 0,
              message: "Please enter a valid tax amount",
            },
          ]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name="due_date"
          label="Due Date"
          rules={[
            {
              required: true,
              type: "date",
              message: "Please select a due date",
            },
          ]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="status"
          label="Status"
          rules={[
            {
              required: true,
              message: "Please select the status",
            },
          ]}
        >
          <Select>
            <Option value="New">New</Option>
            <Option value="Sent">Sent</Option>
            <Option value="Lost">Lost</Option>
            <Option value="Paid">Paid</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="supplier_name"
          label="Supplier Name"
          rules={[
            {
              required: true,
              message: "Please enter the supplier name",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="supplier_address"
          label="Supplier Address"
          rules={[
            {
              required: true,
              message: "Please enter the supplier address",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="customer_name"
          label="Customer Name"
          rules={[
            {
              required: true,
              message: "Please enter the customer name",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="customer_address"
          label="Customer Address"
          rules={[
            {
              required: true,
              message: "Please enter the customer address",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="currency"
          label="Currency"
          rules={[
            {
              required: true,
              message: "Please select the currency",
            },
          ]}
        >
          <Select>
            <Option value="USD">USD</Option>
            <Option value="EUR">EUR</Option>
            <Option value="ILS">ILS</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="payment_terms"
          label="Payment Terms"
          rules={[
            {
              required: true,
              message: "Please enter the payment terms",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="purchase_order_number" label="Purchase Order Number">
          <Input />
        </Form.Item>
        <Form.Item name="shipping_details" label="Shipping Details">
          <Input />
        </Form.Item>
        <Form.Item name="bank_details" label="Bank Details">
          <Input />
        </Form.Item>
        <Form.Item name="regulatory_information" label="Regulatory Information">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InvoiceModal;
