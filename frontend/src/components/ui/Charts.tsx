import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';

/**
 * Renders a responsive pie chart for expense category distribution.
 * @param {Array} data - Array of objects with `name` and `value`
 * @param {Array} colors - Color palette for chart segments
 * @returns {JSX.Element}
 */
// Pie chart for expense distribution
export const renderPieChart = (data, colors) => {
  // Add this line for the totalValue calculation
  const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          // Remove the label property to hide permanent labels
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${((value / totalValue) * 100).toFixed(0)}%`} />
        <Legend
        layout="horizontal"
        verticalAlign="bottom"
        align="center"
        wrapperStyle={{ paddingTop: "20px" }}
      />
      </PieChart>
    </ResponsiveContainer>
  );
};


/**
 * Renders a bar chart for category breakdown of expenses.
 * @param {Array} data - Array with `name` and `value` keys
 * @param {Array} colors - Color palette for bars
 * @returns {JSX.Element}
 */
export const renderBarChart = (data, colors) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>No spending data to display</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `$${value}`} />
        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" animationDuration={1500}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};


/**
 * Renders a line chart comparing income and expenses over time.
 * @param {Array} data - Array of objects with `name`, `income`, and `expenses`
 * @returns {JSX.Element}
 */
export const renderLineChart = (data) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis tickFormatter={(value) => `$${value}`} />
      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
      <Legend />
      <Line
        type="monotone"
        dataKey="income"
        stroke="#8884d8"
        strokeWidth={2}
        activeDot={{ r: 8 }}
        animationDuration={1500}
      />
      <Line
        type="monotone"
        dataKey="expenses"
        stroke="#82ca9d"
        strokeWidth={2}
        animationDuration={1500}
      />
    </LineChart>
  </ResponsiveContainer>
);


/**
 * Renders a stacked bar chart for monthly breakdown by category.
 * @param {Array} data - Array of monthly data with category keys
 * @param {Array} categories - Array of category names
 * @param {Array} colors - Color palette for stacks
 * @returns {JSX.Element}
 */
export const renderStackedBarChart = (data, categories, colors) => (
  <ResponsiveContainer width="100%" height={400}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis tickFormatter={(value) => `$${value}`} />
      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
      <Legend />
      {categories.map((category, index) => (
        <Bar
          key={category}
          dataKey={category}
          stackId="a"
          fill={colors[index % colors.length]}
        />
      ))}
    </BarChart>
  </ResponsiveContainer>
);
