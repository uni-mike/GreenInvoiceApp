export const convertToCSV = (data) => {
  const csvRows = [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatLineItems = (lineItems) => {
    return lineItems
      .map((item) => {
        return `${item.name}: ${item.quantity} x ${item.price}`;
      })
      .join("; ");
  };

  data.forEach((invoice) => {
    const {
      invoice_number,
      issue_date,
      due_date,
      currency,
      total_amount,
      tax_amount,
      description,
      paid,
      customer_name,
      status,
      line_items,
    } = invoice;

    const formattedIssueDate = formatDate(issue_date);
    const formattedDueDate = formatDate(due_date);
    const lineItemsString = formatLineItems(line_items);

    const taxRate = (tax_amount / (total_amount - tax_amount)) * 100;

    const row = [
      invoice_number,
      `"${formattedIssueDate}"`,
      `"${formattedDueDate}"`,
      currency || "",
      total_amount,
      tax_amount,
      taxRate.toFixed(2),
      description || "",
      customer_name,
      paid,
      status,
      `"${lineItemsString}"`,
    ].join(",");

    csvRows.push(row);
  });

  const headerRow =
    "Invoice Number,Issue Date,Due Date,Currency,Total Amount,Tax Amount,Tax Rate,Description,Customer Name, Paid,Status,Line Items";
  csvRows.unshift(headerRow);

  return csvRows.join("\n");
};
