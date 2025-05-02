import React from 'react';
import { useCategories } from '../../context/CategoryContext';
import { financialCalculations } from '../../utils/financialCalculations';
import { useBudgetManagement } from '../../hooks';
import { SpendingLimitForm } from './SpendingLimitForm';
import { SavingsGoalForm } from './SavingsGoalForm';
import { SuggestionCard } from './SuggestionCard';
import { IncomeGoalsProps, Suggestion } from '../../../../types';
import { RawSuggestion } from '../../../../types/domain/finance'; // Adjust the path as needed


export const IncomeGoals: React.FC<IncomeGoalsProps> = ({
  income,
  spendingLimit,
  savingsGoal,
  expensesByCategory,
  incomes,
  setSpendingLimit,
  setSavingsGoal,
  onSuccessMessage = () => {},
  onErrorMessage = () => {},
}) => {
  const totalExpenses = Object.values(expensesByCategory).reduce((sum, v) => sum + v, 0);
  const savings = financialCalculations.calculateSavings(income, totalExpenses);
  const { isOverBudget } = financialCalculations.calculateBudgetStatus(totalExpenses, spendingLimit);
  
  const rawSuggestion = financialCalculations.getSuggestedLimit(incomes) as unknown as RawSuggestion;
  const suggestion: Suggestion | null = rawSuggestion ? {
    ...rawSuggestion,
    daily: parseFloat(rawSuggestion.daily)
  } : null;

  const { loading, updateBudget } = useBudgetManagement({
    onSuccess: onSuccessMessage,
    onError: onErrorMessage,
  });

  const applySpending = (value: number): void => {
    updateBudget('Total', value, '/budgets', 'limit').then(success => {
      if (success) setSpendingLimit(value);
    });
  };

  const applySavings = (value: number): void => {
    updateBudget('Monthly Savings', value, '/savings-goals', 'target_amount').then(success => {
      if (success) setSavingsGoal(value);
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SpendingLimitForm limit={spendingLimit} onSubmit={applySpending} loading={loading} />
      <SavingsGoalForm goal={savingsGoal} onSubmit={applySavings} loading={loading} />
      {suggestion && <SuggestionCard suggestion={suggestion} applyLimit={applySpending} />}
    </div>
  );
};
