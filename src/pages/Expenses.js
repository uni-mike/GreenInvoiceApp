import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Space,
  notification,
  Modal,
  Table,
  Spin,
  Tooltip,
  Select,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../api/api";

const { Option } = Select;

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState({});
  const token = localStorage.getItem("token");

  const [addExpenseData, setAddExpenseData] = useState({
    description: "",
    amount: "",
    currency: "USD",
    type: "",
    payment_method: "",
    status: "",
    vendor: "",
    notes: "",
  });

  const [selectedExpenseData, setSelectedExpenseData] = useState({
    description: "",
    amount: "",
    currency: "",
    type: "",
    payment_method: "",
    status: "",
    vendor: "",
    notes: "",
  });

  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const decodedToken = decodeToken(token);
        const userId = decodedToken?.user_id;

        const data = await getExpenses(token, userId);
        setExpenses(data);
      } catch (error) {
        notification.error({
          message: "Failed to load expenses",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchExpenses();
    }
  }, [token]);

  const refreshExpenses = async () => {
    setLoading(true);
    try {
      const decodedToken = decodeToken(token);
      const userId = decodedToken?.user_id;
      const data = await getExpenses(token, userId);
      setExpenses(data);
    } catch (error) {
      notification.error({
        message: "Failed to refresh expenses",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    try {
      await createExpense(addExpenseData, token);
      setAddModalVisible(false);
      refreshExpenses();
      notification.success({ message: "Expense added successfully" });
      setAddExpenseData({
        description: "",
        amount: "",
        currency: "",
        type: "",
        payment_method: "",
        status: "",
        vendor: "",
        notes: "",
      });
    } catch (error) {
      notification.error({
        message: "Failed to add expense",
        description: error.message,
      });
    }
  };

  const handleEditExpense = async () => {
    try {
      await updateExpense(selectedExpense.id, selectedExpenseData, token);
      setEditModalVisible(false);
      refreshExpenses();
      notification.success({ message: "Expense updated successfully" });
    } catch (error) {
      notification.error({
        message: "Failed to update expense",
        description: error.message,
      });
    }
  };

  const handleDeleteExpense = async () => {
    try {
      await deleteExpense(selectedExpense.id, token);
      setDeleteModalVisible(false);
      refreshExpenses();
      notification.success({ message: "Expense deleted successfully" });
    } catch (error) {
      notification.error({
        message: "Failed to delete expense",
        description: error.message,
      });
    }
  };

  const columns = [
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Currency", dataIndex: "currency", key: "currency" },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Payment Method",
      dataIndex: "payment_method",
      key: "payment_method",
    },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Vendor", dataIndex: "vendor", key: "vendor" },
    { title: "Notes", dataIndex: "notes", key: "notes" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDeleteModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = (e) => setSearchText(e.target.value);

  const handleAddModal = () => {
    setAddModalVisible(true);
    setAddExpenseData({
      description: "",
      amount: "",
      currency: "",
      type: "",
      payment_method: "",
      status: "",
      vendor: "",
      notes: "",
    });
  };

  const handleEditModal = (expense) => {
    setSelectedExpense(expense);
    setSelectedExpenseData({ ...expense });
    setEditModalVisible(true);
  };

  const handleDeleteModal = (expense) => {
    setSelectedExpense(expense);
    setDeleteModalVisible(true);
  };

  const filteredExpenses = expenses.filter((expense) =>
    expense.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Input
        placeholder="Search Expenses"
        value={searchText}
        onChange={handleSearch}
        style={{ marginBottom: 16, width: 240 }}
      />
      <Button
        type="primary"
        onClick={handleAddModal}
        style={{ marginBottom: 16, marginLeft: 8 }}
      >
        Add Expense
      </Button>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={filteredExpenses} rowKey="id" />
      </Spin>
      <Modal
        title="Add New Expense"
        visible={addModalVisible}
        onOk={handleAddExpense}
        onCancel={() => setAddModalVisible(false)}
      >
        <Input
          placeholder="Description"
          value={addExpenseData.description}
          onChange={(e) =>
            setAddExpenseData({
              ...addExpenseData,
              description: e.target.value,
            })
          }
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Amount"
          type="number"
          value={addExpenseData.amount}
          onChange={(e) =>
            setAddExpenseData({ ...addExpenseData, amount: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />
        <Select
          placeholder="Currency"
          value={addExpenseData.currency}
          onChange={(value) =>
            setAddExpenseData({ ...addExpenseData, currency: value })
          }
          style={{ width: "100%", marginBottom: 10 }}
        >
          <Option value="USD">USD</Option>
          <Option value="EUR">EUR</Option>
          <Option value="ILS">ILS</Option>
        </Select>
        <Select
          placeholder="Type"
          value={addExpenseData.type}
          onChange={(value) =>
            setAddExpenseData({ ...addExpenseData, type: value })
          }
          style={{ width: "100%", marginBottom: 10 }}
        >
          <Option value="Travel">Travel</Option>
          <Option value="Supplies">Supplies</Option>
          <Option value="Services">Services</Option>
          <Option value="Food & Beverage">Food & Beverage</Option>
          <Option value="Utilities">Utilities</Option>
          <Option value="Other">Other</Option>
        </Select>
        <Input
          placeholder="Payment Method"
          value={addExpenseData.payment_method}
          onChange={(e) =>
            setAddExpenseData({
              ...addExpenseData,
              payment_method: e.target.value,
            })
          }
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Status"
          value={addExpenseData.status}
          onChange={(e) =>
            setAddExpenseData({ ...addExpenseData, status: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Vendor"
          value={addExpenseData.vendor}
          onChange={(e) =>
            setAddExpenseData({ ...addExpenseData, vendor: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />
        <Input.TextArea
          placeholder="Notes"
          value={addExpenseData.notes}
          onChange={(e) =>
            setAddExpenseData({ ...addExpenseData, notes: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />
      </Modal>

      <Modal
        title="Edit Expense"
        visible={editModalVisible}
        onOk={() => handleEditExpense()}
        onCancel={() => setEditModalVisible(false)}
      >
        <Input
          placeholder="Description"
          value={selectedExpenseData.description}
          onChange={(e) =>
            setSelectedExpenseData({
              ...selectedExpenseData,
              description: e.target.value,
            })
          }
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Amount"
          type="number"
          value={selectedExpenseData.amount}
          onChange={(e) =>
            setSelectedExpenseData({
              ...selectedExpenseData,
              amount: e.target.value,
            })
          }
          style={{ marginBottom: 10 }}
        />
        <Select
          placeholder="Currency"
          value={selectedExpenseData.currency}
          onChange={(value) =>
            setSelectedExpenseData({
              ...selectedExpenseData,
              currency: value,
            })
          }
          style={{ width: "100%", marginBottom: 10 }}
        >
          <Option value="USD">USD</Option>
          <Option value="EUR">EUR</Option>
          <Option value="ILS">ILS</Option>
        </Select>
        <Select
          placeholder="Type"
          value={selectedExpenseData.type}
          onChange={(value) =>
            setSelectedExpenseData({
              ...selectedExpenseData,
              type: value,
            })
          }
          style={{ width: "100%", marginBottom: 10 }}
        >
          <Option value="Travel">Travel</Option>
          <Option value="Supplies">Supplies</Option>
          <Option value="Services">Services</Option>
          <Option value="Food & Beverage">Food & Beverage</Option>
          <Option value="Utilities">Utilities</Option>
          <Option value="Other">Other</Option>
        </Select>
        <Input
          placeholder="Payment Method"
          value={selectedExpenseData.payment_method}
          onChange={(e) =>
            setSelectedExpenseData({
              ...selectedExpenseData,
              payment_method: e.target.value,
            })
          }
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Status"
          value={selectedExpenseData.status}
          onChange={(e) =>
            setSelectedExpenseData({
              ...selectedExpenseData,
              status: e.target.value,
            })
          }
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Vendor"
          value={selectedExpenseData.vendor}
          onChange={(e) =>
            setSelectedExpenseData({
              ...selectedExpenseData,
              vendor: e.target.value,
            })
          }
          style={{ marginBottom: 10 }}
        />
        <Input.TextArea
          placeholder="Notes"
          value={selectedExpenseData.notes}
          onChange={(e) =>
            setSelectedExpenseData({
              ...selectedExpenseData,
              notes: e.target.value,
            })
          }
          style={{ marginBottom: 10 }}
        />
      </Modal>

      <Modal
        title="Confirm Deletion"
        visible={deleteModalVisible}
        onOk={() => handleDeleteExpense(selectedExpense.id)}
        onCancel={() => setDeleteModalVisible(false)}
      >
        Are you sure you want to delete this expense?
      </Modal>
    </div>
  );
};

export default Expenses;
