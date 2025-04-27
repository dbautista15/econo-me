import React from 'react';
import { renderPieChart } from '../ui/Charts.tsx';
import { preparePieChartData } from '../../utils/helpers.tsx';

const ExpenseDistribution = ({ expensesByCategory, colors, totalExpenses }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Expense Distribution</h2>
      
      {Object.keys(expensesByCategory).length > 0 ? (
        <div className="mb-6">
          {renderPieChart(preparePieChartData(expensesByCategory), colors)}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No expense data to display
        </div>
      )}
{/*       
      <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
      <div className="space-y-4">
        {Object.entries(expensesByCategory).map(([category, amount], index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span>{category}</span>
              <span>${amount.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{ 
                  width: `${(amount / totalExpenses) * 100}%`,
                  backgroundColor: colors[index % colors.length]
                }}
              ></div>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default ExpenseDistribution;