import React from "react";
import { Row, Col } from "antd";
import ReactECharts from "echarts-for-react";

const Dashboard = () => {
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <ReactECharts
            option={{
              title: {
                text: "Income vs Expense",
              },
              tooltip: {},
              xAxis: {
                data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
              },
              yAxis: {},
              series: [
                {
                  name: "Income",
                  type: "bar",
                  data: [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000],
                },
                {
                  name: "Expense",
                  type: "bar",
                  data: [800, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500],
                },
              ],
            }}
          />
        </Col>
        <Col span={12}>
          <ReactECharts
            option={{
              title: {
                text: "Expense Distribution Trend",
              },
              tooltip: {},
              xAxis: {
                data: ["Category A", "Category B", "Category C", "Category D", "Category E"],
              },
              yAxis: {},
              series: [
                {
                  name: "Expense",
                  type: "bar",
                  data: [500, 800, 1200, 1500, 2000],
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
                text: "Income Distribution by Customer",
              },
              tooltip: {},
              series: [
                {
                  name: "Income",
                  type: "pie",
                  radius: "50%",
                  data: [
                    { value: 335, name: "Customer A" },
                    { value: 310, name: "Customer B" },
                    { value: 234, name: "Customer C" },
                    { value: 135, name: "Customer D" },
                    { value: 1548, name: "Customer E" },
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
                text: "Income Trend by Service Type",
              },
              tooltip: {},
              xAxis: {
                data: ["Service A", "Service B", "Service C", "Service D", "Service E"],
              },
              yAxis: {},
              series: [
                {
                  name: "Income",
                  type: "line",
                  data: [1500, 1800, 2000, 2200, 2500],
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
