import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, notification, Modal } from "antd";
import {
  listCustomers,
  deleteCustomer,
  createCustomer,
  updateCustomer,
} from "../api/api";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCustomerData, setSelectedCustomerData] = useState({});
  const [addCustomerData, setAddCustomerData] = useState({});
  const [token, setToken] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    const fetchCustomers = async () => {
      try {
        const data = await listCustomers(storedToken);
        setCustomers(data);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleDeleteCustomer = async (customer) => {
    setDeleteModalVisible(true);
    setSelectedCustomer(customer);
  };

  const confirmDeleteCustomer = async () => {
    if (selectedCustomer) {
      try {
        await deleteCustomer(token, selectedCustomer.id);
        notification.success({
          message: "Customer Deleted",
          description: `Customer ${selectedCustomer.name} has been deleted successfully.`,
        });
        setDeleteModalVisible(false);
        refreshCustomerList();
      } catch (error) {
        console.error("Failed to delete customer:", error);
      }
    }
  };

  const handleAddCustomer = () => {
    setAddModalVisible(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomerData(customer);
    setEditModalVisible(true);
  };

  const addNewCustomer = async () => {
    try {
      const data = await createCustomer(token, addCustomerData);
      notification.success({
        message: "Customer Created",
        description: `Customer ${data.name} has been created successfully.`,
      });
      setAddModalVisible(false);
      refreshCustomerList();
    } catch (error) {
      console.error("Failed to create customer:", error);
    }
  };

  const editExistingCustomer = async () => {
    try {
      const data = await updateCustomer(
        token,
        selectedCustomerData.id,
        selectedCustomerData
      );
      notification.success({
        message: "Customer Updated",
        description: `Customer ${data.name} has been updated successfully.`,
      });
      setEditModalVisible(false);
      refreshCustomerList();
    } catch (error) {
      console.error("Failed to update customer:", error);
    }
  };

  const refreshCustomerList = async () => {
    try {
      const updatedCustomers = await listCustomers(token);
      setCustomers(updatedCustomers);
    } catch (error) {
      console.error("Failed to refresh customers:", error);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.includes(searchText)
  );

  const columns = [
    {
      title: "Customer Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button onClick={() => handleEditCustomer(record)}>Edit</Button>
          <Button danger onClick={() => handleDeleteCustomer(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Input
        placeholder="Search Customers by Name"
        value={searchText}
        onChange={handleSearch}
        style={{ width: 200, marginBottom: 20 }}
      />
      <Button
        type="primary"
        style={{ marginBottom: 20 }}
        onClick={handleAddCustomer}
      >
        Add Customer
      </Button>
      <Table columns={columns} dataSource={filteredCustomers} rowKey="id" />
      <Modal
        title="Confirm Delete"
        visible={deleteModalVisible}
        onOk={confirmDeleteCustomer}
        onCancel={() => setDeleteModalVisible(false)}
      >
        Are you sure you want to delete customer{" "}
        {selectedCustomer ? selectedCustomer.name : ""}?
      </Modal>
      <Modal
        title="Add Customer"
        visible={addModalVisible}
        onOk={addNewCustomer}
        onCancel={() => setAddModalVisible(false)}
      >
        <Input
          placeholder="Customer Name"
          value={addCustomerData.name}
          onChange={(e) =>
            setAddCustomerData({ ...addCustomerData, name: e.target.value })
          }
        />
        <Input
          placeholder="Customer Address"
          value={addCustomerData.address}
          onChange={(e) =>
            setAddCustomerData({ ...addCustomerData, address: e.target.value })
          }
        />
      </Modal>
      <Modal
        title="Edit Customer"
        visible={editModalVisible}
        onOk={editExistingCustomer}
        onCancel={() => setEditModalVisible(false)}
      >
        <Input
          placeholder="Customer Name"
          value={selectedCustomerData.name}
          onChange={(e) =>
            setSelectedCustomerData({
              ...selectedCustomerData,
              name: e.target.value,
            })
          }
        />
        <Input
          placeholder="Customer Address"
          value={selectedCustomerData.address}
          onChange={(e) =>
            setSelectedCustomerData({
              ...selectedCustomerData,
              address: e.target.value,
            })
          }
        />
      </Modal>
    </div>
  );
};

export default Customers;
