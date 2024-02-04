import React, { useState } from "react";
import { Modal, Form, Input, Button, notification } from "antd";
import { updateInvoice } from "../api/api";

const EditInvoiceModal = ({ visible, onCancel, invoiceData, onUpdate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const response = await updateInvoice(invoiceData.id, values);
      if (response.success) {
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
      </Form>
    </Modal>
  );
};

export default EditInvoiceModal;
