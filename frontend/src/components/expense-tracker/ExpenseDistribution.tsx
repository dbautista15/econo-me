import React from 'react';
import { renderPieChart } from '../layout/ui/Charts';
import { ExpenseDistributionProps } from '../../../../types';
import { chartUtils } from '../../utils/chartUtils';

export const ExpenseDistribution: React.FC<ExpenseDistributionProps> = ({ 
  expensesByCategory, 
}) => {
  const hasExpenseData = Object.keys(expensesByCategory).length > 0;
  const categories = Object.keys(expensesByCategory);
  const colors = chartUtils.generateCategoryColors(categories);
  const chartData = chartUtils.preparePieChartData(expensesByCategory);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Expense Distribution</h2>
      
      {hasExpenseData ? (
        <div className="mb-6">
          {renderPieChart(chartData, colors)}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No expense data to display
        </div>
      )}
    </div>
  );
};