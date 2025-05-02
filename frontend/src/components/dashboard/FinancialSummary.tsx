import React from 'react';
import { FinancialSummaryProps } from '../../../../types';
import { transformations } from '../../utils/transformations';

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  income,
  totalExpenses,
  savings,
  budgetPercentage,
  isOverBudget,
  savingsProgress,
  savingsGoal,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="text-sm text-gray-500">Current Income</h3>
          <div className="flex items-center">
            <p className="text-2xl font-bold">${transformations.formatCurrency(income)}</p>
          </div>
        </div>
        <div>
          <h3 className="text-sm text-gray-500">Current Expenses</h3>
          <div className="flex items-center">
            <p className="text-2xl font-bold">${transformations.formatCurrency(totalExpenses)}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm text-gray-500">Current Savings</h3>
          <p className="text-2xl font-bold">${transformations.formatCurrency(savings)}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-500">Budget Status</h3>
          <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
            {transformations.formatPercentage(budgetPercentage)}%
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center mb-2">
          <h3 className="text-sm text-gray-500">Savings Goal Progress</h3>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${savingsProgress >= 100 ? 'bg-green-500' : 'bg-blue-600'}`}
            style={{ width: `${Math.min(savingsProgress, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          ${transformations.formatCurrency(savings)} / ${transformations.formatCurrency(savingsGoal)}
        </p>
      </div>
    </div>
  );
};