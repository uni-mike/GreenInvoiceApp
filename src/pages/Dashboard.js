import React, { useState } from "react";
import { Row, Col, Select } from "antd";
import ReactECharts from "echarts-for-react";

const { Option } = Select;

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [incomeData, setIncomeData] = useState({
    month: [335, 310, 234, 135, 1548],
    quarter: [1000, 1500, 2000, 2500, 3000],
    year: [5000, 6000, 7000, 8000, 9000],
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
        <Col span={12}>
          <ReactECharts
            option={{
              title: {
                text: `Income Distribution by Customer (${selectedPeriod})`,
              },
              tooltip: {},
              series: [
                {
                  name: "Income",
                  type: "pie",
                  radius: ["50%", "70%"],
                  data: [
                    {
                      value: incomeData[selectedPeriod][0],
                      name: "Customer A",
                    },
                    {
                      value: incomeData[selectedPeriod][1],
                      name: "Customer B",
                    },
                    {
                      value: incomeData[selectedPeriod][2],
                      name: "Customer C",
                    },
                    {
                      value: incomeData[selectedPeriod][3],
                      name: "Customer D",
                    },
                    {
                      value: incomeData[selectedPeriod][4],
                      name: "Customer E",
                    },
                  ],
                },
              ],
            }}
          />
        </Col>
        <Col span={12}>
          <ReactECharts
            option={{
              title: {
                text: `Income Trend by Service Type (${selectedPeriod})`,
              },
              tooltip: {},
              xAxis: {
                data: [
                  "Service A",
                  "Service B",
                  "Service C",
                  "Service D",
                  "Service E",
                ],
              },
              yAxis: {},
              series: [
                {
                  name: "Income",
                  type: "line",
                  data: incomeData[selectedPeriod],
                },
              ],
            }}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <ReactECharts
            option={{
              title: {
                text: `Income vs Expense (${selectedPeriod})`,
              },
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
                  data: incomeData[selectedPeriod],
                },
                {
                  name: "Expense",
                  type: "bar",
                  data: expenseData[selectedPeriod],
                },
              ],
            }}
          />
        </Col>
        <Col span={12}>
          <ReactECharts
            option={{
              title: {
                text: `Expense Distribution Trend (${selectedPeriod})`,
              },
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
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
