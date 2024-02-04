const BASE_URL = "http://localhost:3000/prod";

// Create a new invoice
export const createInvoice = async (token, invoiceData) => {
  try {
    const response = await fetch(`${BASE_URL}/invoices/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(invoiceData),
    });
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
    const response = await fetch(`${BASE_URL}/users/update/${userId}`, {
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
