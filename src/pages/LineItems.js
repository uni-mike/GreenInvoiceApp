import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, notification, Modal, Select } from "antd";
import {
  listLineItems,
  deleteLineItem,
  createLineItem,
  updateLineItem,
} from "../api/api";

const LineItems = () => {
  const [lineItems, setLineItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedLineItem, setSelectedLineItem] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedLineItemData, setSelectedLineItemData] = useState({});
  const [addLineItemData, setAddLineItemData] = useState({});
  const [token, setToken] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    const tokenData = parseJwt(storedToken);
    if (tokenData && tokenData.user_id) {
      setUserId(tokenData.user_id);
    }

    const fetchLineItems = async () => {
      try {
        const data = await listLineItems(storedToken);
        setLineItems(data);
      } catch (error) {
        console.error("Failed to fetch line items:", error);
      }
    };

    fetchLineItems();
  }, []);

  function parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = decodeURIComponent(
        atob(base64Url)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(base64);
    } catch (error) {
      console.error("Failed to parse JWT token:", error);
      return null;
    }
  }

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleDeleteLineItem = async (lineItem) => {
    setDeleteModalVisible(true);
    setSelectedLineItem(lineItem);
  };

  const confirmDeleteLineItem = async () => {
    if (selectedLineItem) {
      try {
        await deleteLineItem(token, selectedLineItem.id);
        notification.success({
          message: "Line Item Deleted",
          description: `Line Item has been deleted successfully.`,
        });
        setDeleteModalVisible(false);
        refreshLineItemList();
      } catch (error) {
        console.error("Failed to delete line item:", error);
      }
    }
  };

  const handleAddLineItem = () => {
    setAddModalVisible(true);
  };

  const handleEditLineItem = (lineItem) => {
    setSelectedLineItemData(lineItem);
    setEditModalVisible(true);
  };

  const addNewLineItem = async () => {
    try {
      const newItemData = {
        ...addLineItemData,
        currency: selectedCurrency,
        user_id: userId,
      };

      const data = await createLineItem(token, newItemData);

      notification.success({
        message: "Line Item Created",
        description: `Line Item ${data.name} has been created successfully.`,
      });

      setAddLineItemData({});
      setAddModalVisible(false);
      refreshLineItemList();
    } catch (error) {
      console.error("Failed to create line item:", error);
    }
  };

  const editExistingLineItem = async () => {
    try {
      const data = await updateLineItem(
        token,
        selectedLineItemData.id,
        selectedLineItemData
      );
      notification.success({
        message: "Line Item Updated",
        description: `Line Item has been updated successfully.`,
      });
      setEditModalVisible(false);
      refreshLineItemList();
    } catch (error) {
      console.error("Failed to update line item:", error);
    }
  };

  const refreshLineItemList = async () => {
    try {
      const updatedLineItems = await listLineItems(token);
      setLineItems(updatedLineItems);
    } catch (error) {
      console.error("Failed to refresh line items:", error);
    }
  };

  const filteredLineItems = lineItems.filter((lineItem) =>
    lineItem.name.includes(searchText)
  );

  const formatCurrency = (value) => {
    if (typeof value === "number") {
      return `$${value.toFixed(2)}`;
    }
    return value;
  };

  const columns = [
    {
      title: "Line Item Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text, record) => (
        <span>
          {`${record.currency} ${formatCurrency(text || 0, record.currency)}`}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button onClick={() => handleEditLineItem(record)}>Edit</Button>
          <Button danger onClick={() => handleDeleteLineItem(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Input
        placeholder="Search Line Items by Name"
        value={searchText}
        onChange={handleSearch}
        style={{ width: 200, marginBottom: 20 }}
      />
      <Button
        type="primary"
        style={{ marginBottom: 20 }}
        onClick={handleAddLineItem}
      >
        Add Line Item
      </Button>
      <Table columns={columns} dataSource={filteredLineItems} rowKey="id" />
      <Modal
        title="Confirm Delete"
        visible={deleteModalVisible}
        onOk={confirmDeleteLineItem}
        onCancel={() => setDeleteModalVisible(false)}
      >
        Are you sure you want to delete Line Item{" "}
        {selectedLineItem ? selectedLineItem.name : ""}?
      </Modal>
      <Modal
        title="Add Line Item"
        visible={addModalVisible}
        onOk={addNewLineItem}
        onCancel={() => setAddModalVisible(false)}
      >
        <Input
          placeholder="Line Item Name"
          value={addLineItemData.name}
          onChange={(e) =>
            setAddLineItemData({ ...addLineItemData, name: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Quantity"
          value={addLineItemData.quantity}
          onChange={(e) =>
            setAddLineItemData({ ...addLineItemData, quantity: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Price"
          value={addLineItemData.price}
          onChange={(e) =>
            setAddLineItemData({ ...addLineItemData, price: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />
        <Select
          style={{ width: "100%", marginBottom: 10 }}
          defaultValue="USD"
          onChange={(value) => setSelectedCurrency(value)}
        >
          <Select.Option value="USD">USD</Select.Option>
          <Select.Option value="EUR">EUR</Select.Option>
          <Select.Option value="ILS">ILS</Select.Option>
        </Select>
      </Modal>

      <Modal
        title="Edit Line Item"
        visible={editModalVisible}
        onOk={editExistingLineItem}
        onCancel={() => setEditModalVisible(false)}
      >
        <Input
          placeholder="Line Item Name"
          value={selectedLineItemData.name}
          onChange={(e) =>
            setSelectedLineItemData({
              ...selectedLineItemData,
              name: e.target.value,
            })
          }
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Quantity"
          value={selectedLineItemData.quantity}
          onChange={(e) =>
            setSelectedLineItemData({
              ...selectedLineItemData,
              quantity: e.target.value,
            })
          }
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Price"
          value={selectedLineItemData.price}
          onChange={(e) =>
            setSelectedLineItemData({
              ...selectedLineItemData,
              price: e.target.value,
            })
          }
          style={{ marginBottom: 10 }}
        />
        <Select
          style={{ width: "100%", marginBottom: 10 }}
          defaultValue={selectedLineItemData.currency || "USD"}
          onChange={(value) =>
            setSelectedLineItemData({
              ...selectedLineItemData,
              currency: value,
            })
          }
        >
          <Select.Option value="USD">USD</Select.Option>
          <Select.Option value="EUR">EUR</Select.Option>
          <Select.Option value="ILS">ILS</Select.Option>
        </Select>
      </Modal>
    </div>
  );
};

export default LineItems;
