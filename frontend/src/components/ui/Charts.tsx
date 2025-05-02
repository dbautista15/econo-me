import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';
import { ChartDataPoint, LineChartDataPoint, StackedBarChartDataPoint } from '../../../../types';
import { transformations } from '../../utils/transformations';
import { chartUtils } from '../../utils/chartUtils';

/**
 * Renders a responsive pie chart for expense category distribution
 */
export const renderPieChart = (
  data: ChartDataPoint[],
  colors: string[]
): React.ReactElement => {
  // Calculate total for percentage formatting
  const totalValue = transformations.sumValues(data.map(item => item.value || 0));

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
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => 
            `${transformations.formatPercentage(transformations.calculatePercentage(value, totalValue))}%`
          } 
        />
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
 * Renders a bar chart for category breakdown of expenses
 */
export const renderBarChart = (
  data: ChartDataPoint[],
  colors: string[]
): React.ReactElement => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>No spending data to display</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value: number) => `$${transformations.formatCurrency(value)}`} />
        <Tooltip formatter={(value: number) => `$${transformations.formatCurrency(value)}`} />
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
 * Renders a line chart comparing income and expenses over time
 */
export const renderLineChart = (
  data: LineChartDataPoint[]
): React.ReactElement => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis tickFormatter={(value: number) => `$${transformations.formatCurrency(value)}`} />
      <Tooltip formatter={(value: number) => `$${transformations.formatCurrency(value)}`} />
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
 * Renders a stacked bar chart for monthly breakdown by category
 */
export const renderStackedBarChart = (
  data: StackedBarChartDataPoint[],
  categories: string[],
  colors: string[]
): React.ReactElement => (
  <ResponsiveContainer width="100%" height={400}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis tickFormatter={(value: number) => `$${transformations.formatCurrency(value)}`} />
      <Tooltip formatter={(value: number) => `$${transformations.formatCurrency(value)}`} />
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

// Re-export chart utility functions
export const {
  preparePieChartData,
  prepareMonthlyBreakdownData
} = chartUtils;
