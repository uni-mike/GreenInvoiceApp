import React, { useState } from "react";
import { Row, Col, Select, Card } from "antd";
import ReactECharts from "echarts-for-react";

const { Option } = Select;

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [incomeData, setIncomeData] = useState({
    month: [
      { name: "Service A", data: [335, 310, 234, 135, 1548] },
      { name: "Service B", data: [400, 300, 500, 800, 1200] },
      { name: "Service C", data: [200, 500, 700, 900, 1000] },
      { name: "Service D", data: [800, 600, 300, 500, 1000] },
      { name: "Service E", data: [1200, 900, 700, 600, 1500] },
    ],
    quarter: [
      { name: "Service A", data: [1000, 1500, 2000, 2500, 3000] },
      { name: "Service B", data: [1200, 1800, 2500, 3000, 3500] },
      { name: "Service C", data: [800, 1000, 1200, 1500, 1800] },
      { name: "Service D", data: [1500, 2000, 2500, 3000, 3500] },
      { name: "Service E", data: [2000, 2500, 3000, 3500, 4000] },
    ],
    year: [
      { name: "Service A", data: [5000, 6000, 7000, 8000, 9000] },
      { name: "Service B", data: [6000, 7000, 8000, 9000, 10000] },
      { name: "Service C", data: [4000, 5000, 6000, 7000, 8000] },
      { name: "Service D", data: [7000, 8000, 9000, 10000, 11000] },
      { name: "Service E", data: [9000, 10000, 11000, 12000, 13000] },
    ],
  });
  const [expenseData, setExpenseData] = useState({
    month: [800, 1500, 2000, 2500, 3000],
    quarter: [300, 600, 900, 1200, 1500],
    year: [1000, 2000, 3000, 4000, 5000],
  });

  const handlePeriodChange = (value) => {
    setSelectedPeriod(value);
    // Update the expense data according to the selected period
    setExpenseData((prevExpenseData) => ({
      ...prevExpenseData,
      month: generateExpenseData(value),
      quarter: generateExpenseData(value),
      year: generateExpenseData(value),
    }));
  };

  // Function to generate expense data based on the selected period
  const generateExpenseData = (period) => {
    switch (period) {
      case "month":
        return [800, 1500, 2000, 2500, 3000];
      case "quarter":
        return [300, 600, 900, 1200, 1500];
      case "year":
        return [1000, 2000, 3000, 4000, 5000];
      default:
        return [800, 1500, 2000, 2500, 3000];
    }
  };

  return (
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
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card
            title={`Income Distribution by Customer (${selectedPeriod})`}
            bordered={false}
            style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
          >
            <ReactECharts
              option={{
                tooltip: {},
                series: [
                  {
                    name: "Income",
                    type: "pie",
                    radius: ["50%", "70%"],
                    data: incomeData[selectedPeriod].map((item) => ({
                      value: item.data.reduce((acc, curr) => acc + curr, 0),
                      name: item.name,
                    })),
                  },
                ],
              }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title={`Income Trend by Service Type (${selectedPeriod})`}
            bordered={false}
            style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
          >
            <ReactECharts
              option={{
                tooltip: {
                  trigger: "axis",
                },
                legend: {
                  orient: "vertical",
                  right: 20,
                  top: 20,
                  data: incomeData[selectedPeriod].map(
                    (service) => service.name
                  ),
                },
                xAxis: {
                  type: "category",
                  data: ["Jan", "Feb", "Mar", "Apr", "May"],
                },
                yAxis: {
                  type: "value",
                },
                series: incomeData[selectedPeriod].map((service) => ({
                  name: service.name,
                  type: "line",
                  data: service.data,
                })),
              }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title={`Income vs Expense (${selectedPeriod})`}
            bordered={false}
            style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
          >
            <ReactECharts
              option={{
                tooltip: {},
                xAxis: {
                  data: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                },
                yAxis: {},
                series: [
                  {
                    name: "Income",
                    type: "bar",
                    data: incomeData[selectedPeriod].map((item) =>
                      item.data.reduce((acc, curr) => acc + curr, 0)
                    ),
                  },
                  {
                    name: "Expense",
                    type: "bar",
                    data: expenseData[selectedPeriod],
                  },
                ],
              }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={8}>
          <Card
            title={`Expense Distribution Trend (${selectedPeriod})`}
            bordered={false}
            style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
          >
            <ReactECharts
              option={{
                tooltip: {},
                xAxis: {
                  data: [
                    "Category A",
                    "Category B",
                    "Category C",
                    "Category D",
                    "Category E",
                  ],
                },
                yAxis: {},
                series: [
                  {
                    name: "Expense",
                    type: "bar",
                    data: expenseData[selectedPeriod],
                  },
                ],
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
