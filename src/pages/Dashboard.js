import React, { useState, useEffect } from "react";
import { Row, Col, Select, Card, Statistic, Spin } from "antd";
import ReactECharts from "echarts-for-react";
import { listInvoices, listUsers } from "../api/api";

const { Option } = Select;

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [incomeData, setIncomeData] = useState({});
  const [incomeCustomers, setIncomeCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalInvoicesIssued, setTotalInvoicesIssued] = useState(0);
  const [totalInvoicesPaid, setTotalInvoicesPaid] = useState(0);
  const [netCashFlow, setNetCashFlow] = useState(0);
  const [taxDownPaymentPercentage, setTaxDownPaymentPercentage] = useState(0);
  const [monthlySocialSecurityPayment, setMonthlySocialSecurityPayment] =
    useState(0);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [totalIncomeCurrentYear, setTotalIncomeCurrentYear] = useState(0);
  const [totalIncomeToDate, setTotalIncomeToDate] = useState(0);

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
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = decodeToken(token);
      if (decodedToken && decodedToken.user_id) {
        setLoggedInUserId(decodedToken.user_id);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const userData = await listUsers(token, { user_id: loggedInUserId });

        if (Array.isArray(userData)) {
          const currentUser = userData.find(
            (user) => user.id === loggedInUserId
          );

          if (currentUser) {
            setTaxDownPaymentPercentage(
              currentUser.tax_down_payment_percentage
            );
            setMonthlySocialSecurityPayment(
              currentUser.monthly_social_security_payment
            );
          } else {
            console.error("Current user not found");
          }
        } else {
          console.error("User data is not in the expected format");
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (loggedInUserId !== null) {
      fetchUserSettings();
    }
  }, [loggedInUserId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const invoicesData = await listInvoices(token);

        const currentYear = new Date().getFullYear();
        let totalCurrentYearIncome = 0;
        let totalToDateIncome = 0;

        const processedIncomeData = {};
        const processedIncomeCustomers = {};
        let issuedCount = 0;
        let paidCount = 0;
        let totalInvoices = 0;
        let totalIncomeWithoutVAT = 0;
        let totalTaxAmount = 0;

        const getPeriod = (date) => {
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const quarter = Math.ceil(month / 3);
          const biMonthlyStart = month % 2 !== 0 ? month : month - 1;
          const last12Months = new Date();
          last12Months.setFullYear(last12Months.getFullYear() - 1);

          switch (selectedPeriod) {
            case "month":
              return `${month}.${year}`;
            case "quarter":
              return `Q${quarter}.${year}`;
            case "ytd":
              return `YTD.${year}`;
            case "year":
              return `Last 12 Months from ${
                last12Months.getMonth() + 1
              }.${last12Months.getFullYear()}`;
            case "bi-monthly":
              return `Bi-monthly starting ${biMonthlyStart}.${year}`;
            default:
              return "";
          }
        };

        invoicesData.forEach((invoice) => {
          const issueDate = new Date(invoice.issue_date);
          const period = getPeriod(issueDate);
          const totalAmount = parseFloat(invoice.total_amount) || 0;
          totalInvoices += totalAmount;

          if (issueDate.getFullYear() === currentYear) {
            totalCurrentYearIncome += totalAmount;
          }
          totalToDateIncome += totalAmount;

          const taxAmount = parseFloat(invoice.tax_amount) || 0;
          totalTaxAmount += taxAmount;

          invoice.line_items.forEach((item) => {
            const itemTotal =
              (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0);
            totalIncomeWithoutVAT += itemTotal - taxAmount;

            processedIncomeData[item.name] =
              processedIncomeData[item.name] || {};
            processedIncomeData[item.name][period] =
              (processedIncomeData[item.name][period] || 0) + itemTotal;

            processedIncomeCustomers[invoice.customer_name] =
              processedIncomeCustomers[invoice.customer_name] || {};
            processedIncomeCustomers[invoice.customer_name][period] =
              (processedIncomeCustomers[invoice.customer_name][period] || 0) +
              itemTotal;
          });

          issuedCount++;
          if (invoice.status === "Paid") {
            paidCount++;
          }
        });

        const taxDownPaymentDeduction =
          (isNaN(totalIncomeWithoutVAT) ? 0 : totalIncomeWithoutVAT) *
          (parseFloat(taxDownPaymentPercentage) / 100 || 0);
        const socialSecurityPaymentDeduction =
          (parseFloat(monthlySocialSecurityPayment) || 0) *
          getDeductionMultiplier(selectedPeriod);

        const netCashFlow =
          totalInvoices -
          taxDownPaymentDeduction -
          socialSecurityPaymentDeduction -
          totalTaxAmount;

        setIncomeData(processedIncomeData);
        setIncomeCustomers(processedIncomeCustomers);
        setTotalInvoicesIssued(issuedCount);
        setTotalInvoicesPaid(paidCount);
        setNetCashFlow(netCashFlow);
        setTotalIncomeCurrentYear(totalCurrentYearIncome);
        setTotalIncomeToDate(totalToDateIncome);
      } catch (error) {
        console.error("Error fetching and processing invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod, taxDownPaymentPercentage, monthlySocialSecurityPayment]);

  const getDeductionMultiplier = (period) => {
    switch (period) {
      case "month":
        return 1;
      case "quarter":
        return 3;
      case "bi-monthly":
        return 2;
      case "year":
      case "ytd":
        return 12;
      default:
        return 0;
    }
  };

  const handlePeriodChange = (value) => {
    setSelectedPeriod(value);
  };

  const renderIncomeDistributionChart = () => {
    if (!incomeCustomers || Object.keys(incomeCustomers).length === 0) {
      return <div>No data available</div>;
    }

    const sortedCustomers = Object.keys(incomeCustomers).sort(
      (a, b) => getTotalIncome(b) - getTotalIncome(a)
    );
    const top5Customers = sortedCustomers.slice(0, 5);
    const restIncome = sortedCustomers
      .slice(5)
      .reduce((acc, customer) => acc + getTotalIncome(customer), 0);

    const chartData = top5Customers.map((customer) => ({
      value: getTotalIncome(customer),
      name: customer,
    }));
    if (restIncome > 0) {
      chartData.push({ value: restIncome, name: "Others" });
    }

    return (
      <ReactECharts
        option={{
          tooltip: {
            formatter: "{a} <br/>{b} : {c} ({d}%)",
          },
          series: [
            {
              name: "Income",
              type: "pie",
              radius: ["50%", "70%"],
              data: chartData,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.5)",
                },
              },
            },
          ],
        }}
      />
    );
  };

  const renderIncomeTrendByServiceTypeChart = () => {
    if (!incomeData || Object.keys(incomeData).length === 0) {
      return <div>No data available</div>;
    }

    const sortedServices = Object.keys(incomeData).sort(
      (a, b) => getTotalIncome(b) - getTotalIncome(a)
    );
    const top5Services = sortedServices.slice(0, 5);
    const restIncome = sortedServices
      .slice(5)
      .reduce((acc, service) => acc + getTotalIncome(service), 0);

    const seriesData = top5Services.map((service) => ({
      name: service,
      type: "line",
      data: Object.values(incomeData[service]),
      smooth: true,
    }));
    if (restIncome > 0) {
      const restData = sortedServices.slice(5).reduce((acc, service) => {
        Object.keys(incomeData[service]).forEach((period, index) => {
          acc[index] = (acc[index] || 0) + incomeData[service][period];
        });
        return acc;
      }, []);
      seriesData.push({
        name: "Others",
        type: "line",
        data: restData,
        smooth: true,
      });
    }

    return (
      <ReactECharts
        option={{
          tooltip: {
            trigger: "axis",
          },
          legend: {
            orient: "horizontal",
            x: "center",
            y: "bottom",
            data: top5Services.concat(restIncome > 0 ? ["Others"] : []),
          },
          grid: {
            top: "10%",
            left: "10%",
            right: "10%",
            bottom: "20%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
            data: Object.keys(incomeData[sortedServices[0]]),
          },
          yAxis: {
            type: "value",
          },
          series: seriesData,
        }}
      />
    );
  };

  const renderIncomeTrendByCustomerChart = () => {
    if (!incomeCustomers || Object.keys(incomeCustomers).length === 0) {
      return <div>No data available</div>;
    }

    const sortedCustomers = Object.keys(incomeCustomers).sort(
      (a, b) => getTotalIncome(b) - getTotalIncome(a)
    );
    const top5Customers = sortedCustomers.slice(0, 5);
    const restIncome = sortedCustomers
      .slice(5)
      .reduce((acc, customer) => acc + getTotalIncome(customer), 0);

    const seriesData = top5Customers.map((customer) => ({
      name: customer,
      type: "line",
      stack: "total",
      areaStyle: {},
      data: Object.values(incomeCustomers[customer]),
      smooth: true,
    }));
    if (restIncome > 0) {
      const restData = sortedCustomers.slice(5).reduce((acc, customer) => {
        Object.keys(incomeCustomers[customer]).forEach((period, index) => {
          acc[index] = (acc[index] || 0) + incomeCustomers[customer][period];
        });
        return acc;
      }, []);
      seriesData.push({
        name: "Others",
        type: "line",
        stack: "total",
        areaStyle: {},
        data: restData,
        smooth: true,
      });
    }

    return (
      <ReactECharts
        option={{
          tooltip: {
            trigger: "axis",
          },
          legend: {
            orient: "horizontal",
            x: "center",
            y: "bottom",
            data: top5Customers.concat(restIncome > 0 ? ["Others"] : []),
          },
          grid: {
            top: "10%",
            left: "10%",
            right: "10%",
            bottom: "20%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
            data: Object.keys(incomeCustomers[sortedCustomers[0]]),
          },
          yAxis: {
            type: "value",
          },
          series: seriesData,
        }}
      />
    );
  };

  const renderTotalIncomeTrendChart = () => {
    if (!incomeData || Object.keys(incomeData).length === 0) {
      return <div>No data available</div>;
    }

    const totalIncomeTrendData = {};

    Object.keys(incomeData).forEach((service) => {
      Object.keys(incomeData[service]).forEach((period) => {
        if (!totalIncomeTrendData[period]) {
          totalIncomeTrendData[period] = incomeData[service][period];
        } else {
          totalIncomeTrendData[period] += incomeData[service][period];
        }
      });
    });

    return (
      <ReactECharts
        option={{
          tooltip: {
            trigger: "axis",
          },
          xAxis: {
            type: "category",
            data: Object.keys(totalIncomeTrendData),
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              data: Object.values(totalIncomeTrendData),
              type: "line",
              smooth: true,
            },
          ],
        }}
      />
    );
  };

  const TotalIncomeToDate = () => {
    return (
      <Card
        style={{
          marginBottom: "16px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Statistic
          title="Total Invoices for Current Year"
          value={totalIncomeCurrentYear}
          precision={2}
          prefix="$"
        />
      </Card>
    );
  };

  const TotalIncomeEver = () => {
    return (
      <Card
        style={{
          marginBottom: "16px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Statistic
          title="Total Invoices to Date"
          value={totalIncomeToDate}
          precision={2}
          prefix="$"
        />
      </Card>
    );
  };

  const getTotalIncome = (category) => {
    return Object.values(
      incomeData[category] || incomeCustomers[category] || {}
    ).reduce((acc, cur) => acc + cur, 0);
  };

  return (
    <Spin spinning={loading} tip="Loading...">
      <div>
        <Select
          defaultValue="month"
          onChange={handlePeriodChange}
          style={{ marginBottom: "16px", width: "200px" }}
        >
          <Option value="month">Month</Option>
          <Option value="quarter">Quarter</Option>
          <Option value="ytd">Year to Date</Option>
          <Option value="year">Last 12 Months</Option>
          <Option value="bi-monthly">Bi-monthly</Option>
        </Select>
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col span={24}>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <div
                style={{ flex: "1", minWidth: "300px", marginRight: "10px" }}
              >
                <TotalIncomeToDate />
              </div>
              <div
                style={{ flex: "1", minWidth: "300px", marginRight: "10px" }}
              >
                <TotalIncomeEver />
              </div>
              <div
                style={{ flex: "1", minWidth: "300px", marginRight: "10px" }}
              >
                <Card
                  style={{
                    marginBottom: "16px",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Statistic
                    title="Total Invoices Issued"
                    value={totalInvoicesIssued}
                  />
                </Card>
              </div>
              <div
                style={{ flex: "1", minWidth: "300px", marginRight: "10px" }}
              >
                <Card
                  style={{
                    marginBottom: "16px",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Statistic
                    title="Total Invoices Paid"
                    value={totalInvoicesPaid}
                  />
                </Card>
              </div>
              <div style={{ flex: "1", minWidth: "300px" }}>
                <Card
                  style={{
                    marginBottom: "16px",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Statistic
                    title="Net Cash Flow"
                    value={netCashFlow}
                    precision={2}
                    prefix="$"
                  />
                </Card>
              </div>
            </div>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col span={12}>
            <Card
              style={{
                marginBottom: "16px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3>Income Distribution by Customer</h3>
              {renderIncomeDistributionChart()}
            </Card>
          </Col>
          <Col span={12}>
            <Card
              style={{
                marginBottom: "16px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3>Income Trend by Service Type</h3>
              {renderIncomeTrendByServiceTypeChart()}
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col span={12}>
            <Card
              style={{
                marginBottom: "16px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3>Income Trend by Customer</h3>
              {renderIncomeTrendByCustomerChart()}
            </Card>
          </Col>
          <Col span={12}>
            <Card
              style={{
                marginBottom: "16px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3>Total Income Trend</h3>
              {renderTotalIncomeTrendChart()}
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default Dashboard;
