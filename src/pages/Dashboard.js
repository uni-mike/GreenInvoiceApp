import React, { useState, useEffect } from "react";
import { Row, Col, Select, Card, Statistic, Spin } from "antd";
import ReactECharts from "echarts-for-react";
import { listInvoices } from "../api/api";

const { Option } = Select;

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [incomeData, setIncomeData] = useState({});
  const [incomeCustomers, setIncomeCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalInvoicesIssued, setTotalInvoicesIssued] = useState(0);
  const [totalInvoicesPaid, setTotalInvoicesPaid] = useState(0);

  useEffect(() => {
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

    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const invoicesData = await listInvoices(token);
      const processedIncomeData = {};
      const processedIncomeCustomers = {};

      let issuedCount = 0;
      let paidCount = 0;

      invoicesData.forEach((invoice) => {
        const issueDate = new Date(invoice.issue_date);
        const period = getPeriod(issueDate);

        invoice.line_items.forEach((item) => {
          if (!processedIncomeData[item.name]) {
            processedIncomeData[item.name] = {};
          }
          if (!processedIncomeData[item.name][period]) {
            processedIncomeData[item.name][period] = 0;
          }
          processedIncomeData[item.name][period] += item.price * item.quantity;

          if (!processedIncomeCustomers[invoice.customer_name]) {
            processedIncomeCustomers[invoice.customer_name] = {};
          }
          if (!processedIncomeCustomers[invoice.customer_name][period]) {
            processedIncomeCustomers[invoice.customer_name][period] = 0;
          }
          processedIncomeCustomers[invoice.customer_name][period] +=
            item.price * item.quantity;
        });

        issuedCount++;
        if (invoice.status === "Paid") {
          paidCount++;
        }
      });

      setIncomeData(processedIncomeData);
      setIncomeCustomers(processedIncomeCustomers);
      setTotalInvoicesIssued(issuedCount);
      setTotalInvoicesPaid(paidCount);
      setLoading(false);
    };

    fetchData();
  }, [selectedPeriod]);

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

    const totalIncomeTrendData = Object.keys(
      incomeData[Object.keys(incomeData)[0]]
    ).map((period, index) => {
      return Object.values(incomeData).reduce((acc, service) => {
        const income = service[period];
        if (!isNaN(income)) {
          acc += income;
        }
        return acc;
      }, 0);
    });

    return (
      <ReactECharts
        option={{
          tooltip: {
            trigger: "axis",
          },
          xAxis: {
            type: "category",
            data: Object.keys(incomeData[Object.keys(incomeData)[0]]),
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              data: totalIncomeTrendData,
              type: "line",
              smooth: true,
            },
          ],
        }}
      />
    );
  };

  const TotalIncomeToDate = () => {
    const totalIncomeThisYear = 358487.0;

    return (
      <Card
        style={{
          marginBottom: "16px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Statistic
          title="Total Income for Current Year"
          value={totalIncomeThisYear}
          precision={2}
          prefix="$"
        />
      </Card>
    );
  };

  const TotalIncomeEver = () => {
    const totalIncomeEver = 358487.0;

    return (
      <Card
        style={{
          marginBottom: "16px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Statistic
          title="Total Income to Date Ever"
          value={totalIncomeEver}
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
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flex: "1", marginRight: "10px" }}>
                <TotalIncomeToDate />
              </div>
              <div style={{ flex: "1", marginRight: "10px" }}>
                <TotalIncomeEver />
              </div>
              <div style={{ flex: "1" }}>
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
              <div style={{ flex: "1" }}>
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
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card
              title={`Income Top-5 Customers (${selectedPeriod})`}
              style={{
                marginBottom: "16px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              {renderIncomeDistributionChart()}
            </Card>
          </Col>
          <Col span={12}>
            <Card
              title={`Income Trend by Service Type (${selectedPeriod})`}
              style={{
                marginBottom: "16px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              {renderIncomeTrendByServiceTypeChart()}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card
              title={`Income Trend by Customer (${selectedPeriod})`}
              style={{
                marginBottom: "16px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              {renderIncomeTrendByCustomerChart()}
            </Card>
          </Col>
          <Col span={12}>
            <Card
              title={`Total Income Trend (${selectedPeriod})`}
              style={{
                marginBottom: "16px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              {renderTotalIncomeTrendChart()}
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default Dashboard;
