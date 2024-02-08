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

  const [incomeCustomers, setIncomeCustomers] = useState({
    month: [
      { name: "Customer 1", data: [435, 460, 480, 505, 530] },
      { name: "Customer 2", data: [220, 200, 210, 205, 215] },
      { name: "Customer 3", data: [550, 575, 590, 610, 620] },
      { name: "Customer 4", data: [640, 630, 620, 610, 605] },
      { name: "Customer 5", data: [320, 340, 360, 375, 390] },
    ],
    quarter: [
      { name: "Customer 1", data: [1300, 1410, 1530, 1650] },
      { name: "Customer 2", data: [650, 630, 640, 655, 700] },
      { name: "Customer 3", data: [1670, 1720, 1780, 1850] },
      { name: "Customer 4", data: [1920, 1890, 1860, 1830] },
      { name: "Customer 5", data: [980, 1020, 1060, 1100] },
    ],
    year: [
      { name: "Customer 1", data: [5500, 5700, 5900, 6100] },
      { name: "Customer 2", data: [2600, 2650, 2700, 2750] },
      { name: "Customer 3", data: [7000, 7150, 7300, 7450] },
      { name: "Customer 4", data: [7600, 7500, 7400, 7300] },
      { name: "Customer 5", data: [4400, 4500, 4600, 4700] },
    ],
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

  const getXAxisData = (period) => {
    switch (period) {
      case "month":
        return ["Jan", "Feb", "Mar", "Apr", "May"];
      case "quarter":
        return ["Q1", "Q2", "Q3", "Q4"];
      case "year":
        return ["2021", "2022", "2023", "2024", "2025"];
      default:
        return ["Jan", "Feb", "Mar", "Apr", "May"];
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
                    data: incomeCustomers[selectedPeriod].map((item) => ({
                      value: item.data.reduce((acc, curr) => acc + curr, 0),
                      name: item.name,
                    })),
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
                  orient: "horizontal",
                  x: "center",
                  y: "bottom",
                  data: incomeData[selectedPeriod].map(
                    (service) => service.name
                  ),
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
                  data: getXAxisData(selectedPeriod),
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
                  data: getXAxisData(selectedPeriod),
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
                  data: getXAxisData(selectedPeriod),
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
        <Col span={8}>
          <Card
            title={`Income Trend by Customer (${selectedPeriod})`}
            bordered={false}
            style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
          >
            <ReactECharts
              option={{
                tooltip: {
                  trigger: "axis",
                },
                legend: {
                  data: incomeCustomers[selectedPeriod].map(
                    (item) => item.name
                  ),
                  orient: "horizontal",
                  x: "center",
                  y: "bottom",
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
                  data: getXAxisData(selectedPeriod),
                },
                yAxis: {
                  type: "value",
                },
                series: incomeCustomers[selectedPeriod].map((item) => ({
                  name: item.name,
                  type: "line",
                  data: item.data,
                  smooth: true,
                })),
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
