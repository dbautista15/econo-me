import React from 'react';
import { renderBarChart } from './Charts';

const CategoryBreakdownChart = ({ pieChartData, colors }) => (
  <div className="bg-white p-6 rounded-lg shadow-md md:col-span-3">
    <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
    {Array.isArray(pieChartData) && pieChartData.length > 0
      ? renderBarChart(pieChartData, colors)
      : <p>No spending data to display</p>
    }
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
      {pieChartData.map((category, index) => (
        <div key={index} className="p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm text-gray-500">{category.name}</h3>
          <p className="text-xl font-bold text-gray-800">${(+category.value).toFixed(2)}</p>
        </div>
      ))}
    </div>
  </div>
);

export default CategoryBreakdownChart;