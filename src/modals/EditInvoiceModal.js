import React, { useState } from "react";
import { Modal, Form, Input, Button, notification, Select } from "antd";
import { updateInvoice } from "../api/api";

const { Option } = Select;

const EditInvoiceModal = ({ visible, onCancel, invoiceData, onUpdate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const values = await form.validateFields();
      const response = await updateInvoice(token, invoiceData.id, values);

      if (response.message === "Invoice updated successfully") {
        notification.success({
          message: "Invoice Updated",
          description: "The invoice has been updated successfully.",
        });
        onUpdate();
        onCancel();
      } else {
        notification.error({
          message: "Invoice Update Failed",
          description: "Failed to update the invoice. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Edit Invoice"
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="update"
          type="primary"
          onClick={handleUpdate}
          loading={loading}
        >
          Update
        </Button>,
      ]}
    >
      <Form form={form} name="editInvoiceForm" initialValues={invoiceData}>
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
          name="due_date"
          label="Due Date"
          rules={[
            {
              required: true,
              message: "Please enter the due date",
            },
          ]}
        >
          <Input type="date" />
        </Form.Item>
        <Form.Item
          name="total_amount"
          label="Total Amount"
          rules={[
            {
              required: true,
              message: "Please enter the total amount",
            },
          ]}
        >
          <Input type="number" step="0.01" />
        </Form.Item>
        <Form.Item
          name="tax_amount"
          label="Tax Amount"
          rules={[
            {
              required: true,
              message: "Please enter the tax amount",
            },
          ]}
        >
          <Input type="number" step="0.01" />
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
        <Form.Item name="notes" label="Notes">
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[
            {
              required: false,
              message: "Please enter the description",
            },
          ]}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditInvoiceModal;
