import React, { useState } from "react";
import Nav from "../components/Nav";
import SideNav from "../components/SideNav";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from "recharts";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

document.title = "Dashboard";

// Dummy data
const cashFlowData = [
  { name: "Jan", collect: 1500, pay: 700 },
  { name: "Feb", collect: 1700, pay: 900 },
  { name: "Mar", collect: 1800, pay: 1100 },
  { name: "Apr", collect: 1400, pay: 850 },
];

const accountBalanceData = [
  { name: "Cash", value: 400 },
  { name: "Bank", value: 300 },
  { name: "Credit", value: 200 },
  { name: "Other", value: 100 },
];

const COLORS = ["#00C49F", "#0088FE", "#FF8042", "#FFBB28"];

const Dashboard = () => {
  return (
    <>
      <Nav title={"Dashboard"} />
      <main id="main">
        <SideNav />
        <div className="content__body p-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white shadow rounded-md px-4 py-2 flex items-center justify-between">
              <div>
                <p className="text-gray-500">To Collect</p>
                <p className="text-3xl font-bold text-green-600">3,594.6</p>
                <p className="text-sm text-green-500 flex items-center gap-1 mt-1">
                  <FiTrendingUp /> +15% this month
                </p>
              </div>
            </div>
            <div className="bg-white shadow rounded-md px-4 py-2 flex items-center justify-between">
              <div>
                <p className="text-gray-500">To Pay</p>
                <p className="text-3xl font-bold text-red-600">424.8</p>
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <FiTrendingDown /> -5% this month
                </p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Bar Chart */}
            <div className="bg-white shadow rounded-md p-6">
              <h3 className="text-lg font-semibold mb-4">Cash Flow</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={cashFlowData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="collect" fill="#00C49F" />
                  <Bar dataKey="pay" fill="#FF5A5F" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white shadow rounded-md p-6">
              <h3 className="text-lg font-semibold mb-4">Account Wise Balance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={accountBalanceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {accountBalanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Sales */}
            <div className="bg-white shadow rounded-md p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
              <table className="w-full text-left border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Party</th>
                    <th className="p-2">Invoice No</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">Das Computer</td>
                    <td className="p-2">INV3</td>
                    <td className="p-2">28 Dec 2024</td>
                    <td className="p-2 text-green-600">1,200</td>
                  </tr>
                  <tr>
                    <td className="p-2">FIZZ</td>
                    <td className="p-2">INV4</td>
                    <td className="p-2">18 Dec 2024</td>
                    <td className="p-2 text-green-600">350</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recent Purchases */}
            <div className="bg-white shadow rounded-md p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Purchases</h3>
              <table className="w-full text-left border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Party</th>
                    <th className="p-2">Invoice No</th>
                    <th className="p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">Bishai Computer Shop</td>
                    <td className="p-2">INV8</td>
                    <td className="p-2 text-red-600">1,200</td>
                  </tr>
                  <tr>
                    <td className="p-2">Computer Land</td>
                    <td className="p-2">INV9</td>
                    <td className="p-2 text-red-600">350</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
