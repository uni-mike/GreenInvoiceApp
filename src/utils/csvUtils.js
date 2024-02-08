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
      id,
      invoice_number,
      issue_date,
      due_date,
      total_amount,
      tax_amount,
      description,
      paid,
      status,
      line_items,
    } = invoice;

    const formattedIssueDate = formatDate(issue_date);
    const formattedDueDate = formatDate(due_date);
    const lineItemsString = formatLineItems(line_items);

    const row = [
      id,
      invoice_number,
      `"${formattedIssueDate}"`,
      `"${formattedDueDate}"`,
      total_amount,
      tax_amount,
      description || "",
      paid,
      status,
      `"${lineItemsString}"`,
    ].join(",");

    csvRows.push(row);
  });

  const headerRow =
    "ID,Invoice Number,Issue Date,Due Date,Total Amount,Tax Amount,Description,Paid,Status,Line Items";
  csvRows.unshift(headerRow);

  return csvRows.join("\n");
};
