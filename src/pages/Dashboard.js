import React, { useState, useEffect } from "react";
import { Row, Col, Select, Card, Statistic, Spin } from "antd";
import ReactECharts from "echarts-for-react";
import { listInvoices } from "../api/api";

const { Option } = Select;

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [incomeData, setIncomeData] = useState({});
  const [incomeCustomers, setIncomeCustomers] = useState({});
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalInvoicesPaid, setTotalInvoicesPaid] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const invoicesData = await listInvoices(token);

        const incomeData = {};
        const incomeCustomers = {};

        let totalIncomeToDate = 0;
        let totalInvoices = 0;
        let totalInvoicesPaid = 0;

        invoicesData.forEach((invoice) => {
          const issueDate = new Date(invoice.issue_date);
          const period = getPeriod(issueDate);

          invoice.line_items.forEach((item) => {
            const existingService = incomeData[item.name];
            if (existingService) {
              existingService[period] =
                (existingService[period] || 0) + item.price * item.quantity;
            } else {
              incomeData[item.name] = { [period]: item.price * item.quantity };
            }

            const existingCustomer = incomeCustomers[invoice.customer_name];
            if (existingCustomer) {
              existingCustomer[period] =
                (existingCustomer[period] || 0) + item.price * item.quantity;
            } else {
              incomeCustomers[invoice.customer_name] = {
                [period]: item.price * item.quantity,
              };
            }
          });

          totalIncomeToDate += invoice.total_amount;
          totalInvoices++;
          if (invoice.status === "Paid") {
            totalInvoicesPaid++;
          }
        });

        setIncomeData(incomeData);
        setIncomeCustomers(incomeCustomers);
        setTotalInvoices(totalInvoices);
        setTotalInvoicesPaid(totalInvoicesPaid);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  const handlePeriodChange = (value) => {
    setSelectedPeriod(value);
  };

  const getPeriod = (date) => {
    switch (selectedPeriod) {
      case "month":
        return `${date.getMonth() + 1}/${date.getFullYear()}`;
      case "quarter":
        return `Q${Math.floor(date.getMonth() / 3) + 1}/${date.getFullYear()}`;
      case "year":
        return date.getFullYear().toString();
      default:
        return "";
    }
  };

  const renderIncomeDistributionChart = () => {
    if (!incomeCustomers || Object.keys(incomeCustomers).length === 0) {
      return <div>No data available</div>;
    }

    const totalIncome = Object.values(incomeCustomers)
      .flatMap((customer) => Object.values(customer))
      .reduce((acc, cur) => acc + cur, 0);

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
      chartData.push({ value: restIncome, name: "Rest" });
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

    const totalIncome = Object.values(incomeData)
      .flatMap((service) => Object.values(service))
      .reduce((acc, cur) => acc + cur, 0);

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
        name: "Rest",
        type: "line",
        data: restData,
        areaStyle: {},
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
            data: top5Services.concat(restIncome > 0 ? ["Rest"] : []),
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

    const totalIncome = Object.values(incomeCustomers)
      .flatMap((customer) => Object.values(customer))
      .reduce((acc, cur) => acc + cur, 0);

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
        name: "Rest",
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
            data: top5Customers.concat(restIncome > 0 ? ["Rest"] : []),
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
    const totalIncomeThisYear = Object.values(incomeCustomers)
      .flatMap((customer) => {
        const validValues = Object.values(customer).filter(
          (value) => !isNaN(value)
        );

        return validValues;
      })
      .reduce((acc, cur) => acc + cur, 0);

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
        />
      </Card>
    );
  };

  const TotalIncomeEver = () => {
    const totalIncomeEver = Object.values(incomeCustomers)
      .flatMap((customer) => Object.values(customer))
      .filter((value) => !isNaN(value)) // Filter out NaN values
      .reduce((acc, cur) => acc + cur, 0);

    return (
      <Card
        style={{
          marginBottom: "16px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Statistic title="Total Income to Date Ever" value={totalIncomeEver} />
      </Card>
    );
  };

  const TotalInvoices = () => {
    return (
      <Card
        style={{
          marginBottom: "16px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Statistic title="Total Invoices Issued" value={totalInvoices} />
      </Card>
    );
  };

  const TotalInvoicesPaid = () => {
    return (
      <Card
        style={{
          marginBottom: "16px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Statistic title="Total Invoices Paid" value={totalInvoicesPaid} />
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
          style={{ marginBottom: "16px" }}
        >
          <Option value="month">Month</Option>
          <Option value="quarter">Quarter</Option>
          <Option value="year">Year</Option>
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
              <div style={{ flex: "1", marginRight: "10px" }}>
                <TotalInvoices />
              </div>
              <div style={{ flex: "1" }}>
                <TotalInvoicesPaid />
              </div>
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card
              title={`Income Top-5 customers`}
              bordered={false}
              style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
            >
              {renderIncomeDistributionChart()}
            </Card>
          </Col>
          <Col span={12}>
            <Card
              title={`Total Income Trend (${selectedPeriod})`}
              bordered={false}
              style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
            >
              {renderTotalIncomeTrendChart()}
            </Card>
          </Col>
          <Col span={12}>
            <Card
              title={`Income trend top-5 Service Types (${selectedPeriod})`}
              bordered={false}
              style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
            >
              {renderIncomeTrendByServiceTypeChart()}
            </Card>
          </Col>
          <Col span={12}>
            <Card
              title={`Income trend top-5 Customer (${selectedPeriod})`}
              bordered={false}
              style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
            >
              {renderIncomeTrendByCustomerChart()}
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default Dashboard;
