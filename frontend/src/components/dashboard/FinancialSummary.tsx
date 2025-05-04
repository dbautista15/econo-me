import React from 'react';
import { transformations } from '../../utils/transformations';
import { Progress } from '../ui';

interface FinancialSummaryProps {
  income: number;
  totalExpenses: number;
  savings: number;
  budgetPercentage: number;
  isOverBudget: boolean;
  savingsProgress: number;
  savingsGoal: number;
  incomes?: any[]; // Not used in this component anymore
  onAddIncome?: (amount: number, date: string) => Promise<boolean>; // Not used in this component anymore
  onDeleteIncome?: (id: number) => Promise<boolean>; // Not used in this component anymore
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  income,
  totalExpenses,
  savings,
  budgetPercentage,
  isOverBudget,
  savingsProgress,
  savingsGoal
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600">Monthly Income</p>
          <p className="text-2xl font-bold">${transformations.formatCurrency(income)}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-2xl font-bold">${transformations.formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      <div className="mb-6">
        <Progress
          label="Budget Usage"
          percent={budgetPercentage}
          color={isOverBudget ? 'bg-red-500' : 'bg-green-500'}
        />
      </div>

      <div className="mb-6">
        <Progress
          label={`Savings (${transformations.formatCurrency(savings)} of ${transformations.formatCurrency(savingsGoal)})`}
          percent={savingsProgress}
          color="bg-blue-500"
        />
      </div>

      <div className="border-t pt-4 mt-4">
        <p className="text-sm text-gray-600">Remaining Income</p>
        <p className={`text-2xl font-bold ${savings < 0 ? 'text-red-600' : 'text-green-600'}`}>
          ${transformations.formatCurrency(savings)}
        </p>
      </div>
    </div>
  );
};