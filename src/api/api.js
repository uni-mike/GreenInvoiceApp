const BASE_URL = "http://localhost:3000/prod";
// const BASE_URL = "https://s6su7nf5mh.execute-api.us-east-2.amazonaws.com/prod/";

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

    const data = await response.json();

    if (response.ok) {
      if (data.message === "OTP is missing") {
        return {
          needOtpValidation: true,
          userData: data,
        };
      } else {
        return {
          needOtpValidation: false,
          userData: data,
          token: data.token,
        };
      }
    } else {
      throw new Error(data.message || "Authentication failed");
    }
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
export const listUsers = async (token, params) => {
  try {
    const response = await fetch(
      `${BASE_URL}/users/list?user_id=${params.user_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("List users failed");
    }
    const userData = await response.json();

    if (typeof userData === "object" && userData !== null) {
      const usersArray = [userData];
      return usersArray;
    } else {
      throw new Error("User data is not in the expected format");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
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

// Create a new line item
export const createLineItem = async (token, lineItemData) => {
  try {
    const response = await fetch(`${BASE_URL}/line_items/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(lineItemData),
    });
    if (!response.ok) {
      throw new Error("Create line item failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Get details of a specific line item
export const getLineItem = async (token, lineItemId) => {
  try {
    const response = await fetch(`${BASE_URL}/line_items/${lineItemId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Get line item failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Update an existing line item
export const updateLineItem = async (token, lineItemId, updateData) => {
  try {
    const response = await fetch(
      `${BASE_URL}/line_items/update/${lineItemId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      }
    );
    if (!response.ok) {
      throw new Error("Update line item failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// List all line items for the current user
export const listLineItems = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/line_items/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("List line items failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Delete a line item
export const deleteLineItem = async (token, lineItemId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/line_items/delete/${lineItemId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      const data = await response.json();
      return data;
    } else if (response.status === 401) {
      console.error(
        "Unauthorized: You do not have permission to delete this line item"
      );
      return null;
    } else {
      throw new Error("Delete line item failed");
    }
  } catch (error) {
    throw error;
  }
};

// Send email with the invoice details
export const sendInvoiceEmail = async (token, invoiceId, email) => {
  try {
    const requestBody = { invoice_id: invoiceId, recipient_email: email };
    const response = await fetch(`${BASE_URL}/invoices/send_invoice_email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      throw new Error("Failed to send email");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const validateOTP = async (otp) => {
  try {
    const response = await fetch(`${BASE_URL}/validate_otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp }),
    });

    if (!response.ok) {
      throw new Error("OTP validation failed");
    }

    const data = await response.json();

    if (data.message === "OTP is valid") {
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    throw error;
  }
};

// Fetch exported invoice data for the current user
export const fetchExportedInvoices = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/invoices/export`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch exported invoices");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
