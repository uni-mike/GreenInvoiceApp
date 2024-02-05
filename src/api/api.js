const BASE_URL = "http://localhost:3000/prod";

// Create a new invoice
export const createInvoice = async (invoiceData, token) => {
  try {
    const response = await fetch(`${BASE_URL}/invoices/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(invoiceData),
    });
    console.log("TOKEN: ", token);
    console.log("RESPONSE: ", response);
    if (!response.ok) {
      throw new Error("Create invoice failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Get details of a specific invoice
export const getInvoice = async (token, invoiceId) => {
  try {
    const response = await fetch(`${BASE_URL}/invoices/${invoiceId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Get invoice failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Update an existing invoice
export const updateInvoice = async (token, invoiceId, updateData) => {
  try {
    const response = await fetch(`${BASE_URL}/invoices/update/${invoiceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error("Update invoice failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// List all invoices for the current user
export const listInvoices = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/invoices/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("List invoices failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Delete an invoice
export const deleteInvoice = async (token, invoiceId) => {
  try {
    const response = await fetch(`${BASE_URL}/invoices/delete/${invoiceId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Delete invoice failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Restore a deleted invoice
export const restoreInvoice = async (token, invoiceId) => {
  try {
    const response = await fetch(`${BASE_URL}/invoices/restore/${invoiceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Restore invoice failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/users/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error("Create user failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Authenticate a user
export const authenticateUser = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/users/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      throw new Error("Authentication failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Update user details
export const updateUser = async (token, userId, updateData) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error("Update user failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Deactivate a user
export const deactivateUser = async (token, userId) => {
  try {
    const response = await fetch(`${BASE_URL}/users/deactivate/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Deactivate user failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// List all users
export const listUsers = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/users/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("List users failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Create a new customer
export const createCustomer = async (token, customerData) => {
  try {
    const response = await fetch(`${BASE_URL}/customers/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(customerData),
    });
    if (!response.ok) {
      throw new Error("Create customer failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Get details of a specific customer
export const getCustomer = async (token, customerId) => {
  try {
    const response = await fetch(`${BASE_URL}/customers/${customerId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Get customer failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Update an existing customer
export const updateCustomer = async (token, customerId, updateData) => {
  try {
    const response = await fetch(`${BASE_URL}/customers/${customerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error("Update customer failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// List all customers for the current user
export const listCustomers = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/customers/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("List customers failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Delete a customer
export const deleteCustomer = async (token, customerId) => {
  try {
    const response = await fetch(`${BASE_URL}/customers/${customerId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 200) {
      throw new Error("Delete customer failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Create a new supplier
export const createSupplier = async (token, supplierData) => {
  try {
    const response = await fetch(`${BASE_URL}/suppliers/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(supplierData),
    });
    if (!response.ok) {
      throw new Error("Create supplier failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Get details of a specific supplier
export const getSupplier = async (token, supplierId) => {
  try {
    const response = await fetch(`${BASE_URL}/suppliers/${supplierId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Get supplier failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Update an existing supplier
export const updateSupplier = async (token, supplierId, updateData) => {
  try {
    const response = await fetch(`${BASE_URL}/suppliers/${supplierId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error("Update supplier failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// List all suppliers for the current user
export const listSuppliers = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/suppliers/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("List suppliers failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Delete a supplier
export const deleteSupplier = async (token, supplierId) => {
  try {
    const response = await fetch(`${BASE_URL}/suppliers/${supplierId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      return data;
    } else if (response.status === 401) {
      console.error(
        "Unauthorized: You do not have permission to delete this supplier"
      );
      return null;
    } else {
      throw new Error("Delete supplier failed");
    }
  } catch (error) {
    throw error;
  }
};
