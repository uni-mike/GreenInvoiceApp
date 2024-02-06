import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  notification,
  DatePicker,
  Select,
  InputNumber,
} from "antd";
import {
  createInvoice,
  listCustomers,
  listSuppliers,
  listLineItems,
} from "../api/api";

const { Option } = Select;

const InvoiceModal = ({ visible, onCancel, onCreate, token }) => {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [customerAddress, setCustomerAddress] = useState("Unknown Address");
  const [supplierAddress, setSupplierAddress] = useState("Unknown Address");

  useEffect(() => {
    if (visible) {
      const fetchData = async () => {
        try {
          const [customersRes, suppliersRes, lineItemsRes] = await Promise.all([
            listCustomers(token),
            listSuppliers(token),
            listLineItems(token),
          ]);
          setCustomers(customersRes);
          setSuppliers(suppliersRes);
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

  const handleCustomerNameChange = (value) => {
    const selectedCustomer = customers.find(
      (customer) => customer.name === value
    );
    if (selectedCustomer) {
      setCustomerAddress(selectedCustomer.address);
    } else {
      setCustomerAddress("Unknown Address");
    }
  };

  const handleSupplierNameChange = (value) => {
    const selectedSupplier = suppliers.find(
      (supplier) => supplier.name === value
    );
    if (selectedSupplier) {
      setSupplierAddress(selectedSupplier.address);
    } else {
      setSupplierAddress("Unknown Address");
    }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();

      const subtotal = values.line_items.reduce((total, lineItemId) => {
        const item = lineItems.find(({ id }) => id === lineItemId);
        return total + (item ? item.price * (item.quantity || 1) : 0);
      }, 0);

      const taxRate = values.tax_rate / 100;
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;

      const invoiceData = {
        invoice_number: values.invoice_number,
        due_date: values.due_date.format("YYYY-MM-DD"),
        customer_name: values.customer_name,
        customer_address: customerAddress,
        supplier_name: values.supplier_name,
        supplier_address: supplierAddress,
        line_items: values.line_items
          .map((lineItemId) => {
            const item = lineItems.find(({ id }) => id === lineItemId);
            return item ? { id: item.id, quantity: item.quantity } : null;
          })
          .filter((item) => item !== null),
        currency: values.currency,
        status: values.status,
        payment_terms: values.payment_terms,
        purchase_order_number: values.purchase_order_number,
        shipping_details: values.shipping_details,
        bank_details: values.bank_details,
        regulatory_information: values.regulatory_information,
        notes: values.notes,
        total_amount: totalAmount.toFixed(2),
        tax_amount: taxAmount.toFixed(2),
      };

      const response = await createInvoice(invoiceData, token);

      if (response && response.invoice_id) {
        notification.success({
          message: "Invoice Created",
          description: "The invoice has been successfully created.",
        });
        form.resetFields();
        onCancel();
        onCreate();
      } else {
        throw new Error("Unexpected response from the server.");
      }
    } catch (error) {
      notification.error({
        message: "Failed to Create Invoice",
        description: error.message || "Please try again later.",
      });
    }
  };

  return (
    <Modal
      visible={visible}
      title="Create New Invoice"
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleCreate}>
          Create
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="invoice_number"
          label="Invoice Number"
          rules={[{ required: true }]}
        >
          <Input />
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
          label="Customer Name"
          rules={[{ required: true }]}
        >
          <Select showSearch onChange={handleCustomerNameChange}>
            {customers.map((customer) => (
              <Option key={customer.id} value={customer.name}>
                {customer.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="supplier_name"
          label="Supplier Name"
          rules={[{ required: true }]}
        >
          <Select showSearch onChange={handleSupplierNameChange}>
            {suppliers.map((supplier) => (
              <Option key={supplier.id} value={supplier.name}>
                {supplier.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="line_items"
          label="Line Items"
          rules={[{ required: true }]}
        >
          <Select mode="multiple" placeholder="Select line items">
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
          <InputNumber min={0} max={100} />
        </Form.Item>
        <Form.Item
          name="currency"
          label="Currency"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="USD">USD</Option>
            <Option value="EUR">EUR</Option>
            <Option value="GBP">GBP</Option>
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
        <Form.Item label="Bill To:" style={{ marginBottom: 0 }}>
          <p>{customerAddress}</p>
        </Form.Item>
        <Form.Item label="Ship To:" style={{ marginBottom: 0 }}>
          <p>{supplierAddress}</p>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InvoiceModal;
