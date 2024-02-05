import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, notification, Modal } from "antd";
import {
  listSuppliers,
  deleteSupplier,
  createSupplier,
  updateSupplier,
} from "../api/api";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSupplierData, setSelectedSupplierData] = useState({});
  const [addSupplierData, setAddSupplierData] = useState({});
  const [token, setToken] = useState("");
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    const fetchSuppliers = async () => {
      try {
        const data = await listSuppliers(storedToken);
        setSuppliers(data);
      } catch (error) {
        console.error("Failed to fetch suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleDeleteSupplier = async (supplier) => {
    setDeleteModalVisible(true);
    setSelectedSupplier(supplier);
  };

  const confirmDeleteSupplier = async () => {
    if (selectedSupplier) {
      try {
        await deleteSupplier(token, selectedSupplier.id);
        notification.success({
          message: "Supplier Deleted",
          description: `Supplier ${selectedSupplier.name} has been deleted successfully.`,
        });
        setDeleteModalVisible(false);
        refreshSupplierList();
      } catch (error) {
        console.error("Failed to delete supplier:", error);
      }
    }
  };

  const handleAddSupplier = () => {
    setAddModalVisible(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplierData(supplier);
    setEditModalVisible(true);
  };

  const addNewSupplier = async () => {
    try {
      const data = await createSupplier(token, addSupplierData);
      notification.success({
        message: "Supplier Created",
        description: `Supplier ${data.name} has been created successfully.`,
      });
      setAddModalVisible(false);
      refreshSupplierList();
    } catch (error) {
      console.error("Failed to create supplier:", error);
    }
  };

  const editExistingSupplier = async () => {
    try {
      const data = await updateSupplier(
        token,
        selectedSupplierData.id,
        selectedSupplierData
      );
      notification.success({
        message: "Supplier Updated",
        description: `Supplier ${data.name} has been updated successfully.`,
      });
      setEditModalVisible(false);
      refreshSupplierList();
    } catch (error) {
      console.error("Failed to update supplier:", error);
    }
  };

  const refreshSupplierList = async () => {
    try {
      const updatedSuppliers = await listSuppliers(token);
      setSuppliers(updatedSuppliers);
    } catch (error) {
      console.error("Failed to refresh suppliers:", error);
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.includes(searchText)
  );

  const columns = [
    {
      title: "Supplier Name",
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
          <Button onClick={() => handleEditSupplier(record)}>Edit</Button>
          <Button danger onClick={() => handleDeleteSupplier(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Input
        placeholder="Search Suppliers by Name"
        value={searchText}
        onChange={handleSearch}
        style={{ width: 200, marginBottom: 20 }}
      />
      <Button
        type="primary"
        style={{ marginBottom: 20 }}
        onClick={handleAddSupplier}
      >
        Add Supplier
      </Button>
      <Table columns={columns} dataSource={filteredSuppliers} rowKey="id" />
      <Modal
        title="Confirm Delete"
        visible={deleteModalVisible}
        onOk={confirmDeleteSupplier}
        onCancel={() => setDeleteModalVisible(false)}
      >
        Are you sure you want to delete supplier{" "}
        {selectedSupplier ? selectedSupplier.name : ""}?
      </Modal>
      <Modal
        title="Add Supplier"
        visible={addModalVisible}
        onOk={addNewSupplier}
        onCancel={() => setAddModalVisible(false)}
      >
        <Input
          placeholder="Supplier Name"
          value={addSupplierData.name}
          onChange={(e) =>
            setAddSupplierData({ ...addSupplierData, name: e.target.value })
          }
        />
        <Input
          placeholder="Supplier Address"
          value={addSupplierData.address}
          onChange={(e) =>
            setAddSupplierData({ ...addSupplierData, address: e.target.value })
          }
        />
      </Modal>
      <Modal
        title="Edit Supplier"
        visible={editModalVisible}
        onOk={editExistingSupplier}
        onCancel={() => setEditModalVisible(false)}
      >
        <Input
          placeholder="Supplier Name"
          value={selectedSupplierData.name}
          onChange={(e) =>
            setSelectedSupplierData({
              ...selectedSupplierData,
              name: e.target.value,
            })
          }
        />
        <Input
          placeholder="Supplier Address"
          value={selectedSupplierData.address}
          onChange={(e) =>
            setSelectedSupplierData({
              ...selectedSupplierData,
              address: e.target.value,
            })
          }
        />
      </Modal>
    </div>
  );
};

export default Suppliers;
