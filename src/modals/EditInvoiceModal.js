import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  notification,
  Select,
  DatePicker,
  InputNumber,
} from "antd";
import moment from "moment";
import { updateInvoice, listCustomers, listLineItems } from "../api/api";

const { Option } = Select;

const EditInvoiceModal = ({
  visible,
  onCancel,
  invoiceData,
  onUpdate,
  token,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [lineItems, setLineItems] = useState([]);

  useEffect(() => {
    if (visible) {
      const fetchData = async () => {
        try {
          const [customersRes, lineItemsRes] = await Promise.all([
            listCustomers(token),
            listLineItems(token),
          ]);
          setCustomers(customersRes);
          setLineItems(lineItemsRes);
        } catch (error) {
          notification.error({
            message: "Error fetching data",
            description: error.message,
          });
        }
      };
      fetchData();
    }
  }, [visible, token]);

  useEffect(() => {
    if (invoiceData) {
      form.setFieldsValue({
        ...invoiceData,
        due_date: invoiceData.due_date ? moment(invoiceData.due_date) : null,
        line_items: invoiceData.line_items.map((item) => item.id),
        tax_rate:
          (parseFloat(invoiceData.tax_amount) /
            (parseFloat(invoiceData.total_amount) -
              parseFloat(invoiceData.tax_amount))) *
          100,
      });
    }
  }, [form, invoiceData]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const updatedValues = {
        ...values,
        due_date: values.due_date ? values.due_date.format("YYYY-MM-DD") : "",
        line_items: values.line_items.map((id) => ({
          id,
          quantity:
            invoiceData.line_items.find((item) => item.id === id)?.quantity ||
            1,
        })),
      };

      const response = await updateInvoice(
        token,
        invoiceData.id,
        updatedValues
      );

      if (response && response.message === "Invoice updated successfully") {
        notification.success({
          message: "Invoice Updated",
          description: "The invoice has been updated successfully.",
        });
        onUpdate();
      } else {
        throw new Error("Failed to update the invoice.");
      }
    } catch (error) {
      notification.error({
        message: "Invoice Update Failed",
        description: error.message || "Please try again.",
      });
    } finally {
      setLoading(false);
      onCancel();
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
      <Form form={form} layout="vertical">
        <Form.Item
          name="invoice_number"
          label="Invoice Number"
          rules={[{ required: true }]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="due_date"
          label="Due Date"
          rules={[{ required: true }]}
        >
          <DatePicker />
        </Form.Item>
        <Form.Item
          name="customer_name"
          label="Bill to Name"
          rules={[{ required: true }]}
        >
          <Input defaultValue={invoiceData.customer_name} />
        </Form.Item>
        <Form.Item name="customer_address" label="Bill to Address">
          <Input defaultValue={invoiceData.customer_address} />
        </Form.Item>
        <Form.Item
          name="supplier_name"
          label="Ship to Name"
          rules={[{ required: true }]}
        >
          <Input defaultValue={invoiceData.supplier_name} />
        </Form.Item>
        <Form.Item name="supplier_address" label="Ship to Address">
          <Input defaultValue={invoiceData.supplier_address} />
        </Form.Item>
        <Form.Item
          name="line_items"
          label="Line Items"
          rules={[{ required: true }]}
        >
          <Select
            mode="multiple"
            defaultValue={invoiceData.line_items.map((item) => item.id)}
          >
            {lineItems.map((item) => (
              <Option
                key={item.id}
                value={item.id}
              >{`${item.name} - Price: ${item.price}`}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="tax_rate"
          label="Tax Rate (%)"
          rules={[{ required: true }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          name="currency"
          label="Currency"
          rules={[{ required: true }]}
        >
          <Select defaultValue={invoiceData.currency}>
            <Option value="USD">USD</Option>
            <Option value="EUR">EUR</Option>
            <Option value="ILS">ILS</Option>
          </Select>
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select>
            <Option value="New">New</Option>
            <Option value="Sent">Sent</Option>
            <Option value="Paid">Paid</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="payment_terms"
          label="Payment Terms"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="purchase_order_number" label="Purchase Order Number">
          <Input />
        </Form.Item>
        <Form.Item name="shipping_details" label="Shipping Details">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="bank_details" label="Bank Details">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="regulatory_information" label="Regulatory Information">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditInvoiceModal;
