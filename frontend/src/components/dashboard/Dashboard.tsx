import React from 'react';
import { DashboardProps } from '../../../../types';
import {
  useExpenseManagement,
  useIncomeManagement,
  useBudgetManagement
} from '../../hooks';

import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Alert } from '../ui/Alert';
import { FinancialSummary } from './FinancialSummary';
import DeleteExpenses from '../expensetracker/DeleteExpenses';
import { ExpenseDistribution } from '../expensetracker/ExpenseDistribution';
import AddExpenseForm from '../expensetracker/AddExpenseForm';
import ExpenseFilter from '../expensetracker/ExpenseFilter';
import { CategoryBudgetManager } from '../budget/CategoryBudgetManager';
import { FinancialInsights } from './FinancialInsights';
import { IncomeGoals } from '../budget/IncomeGoals';
import { ExpenseForm } from '../../../../types';

// The Dashboard component receives all the financial data from the container
const Dashboard: React.FC<DashboardProps> = ({
  income,
  incomes,
  savingsGoal,
  spendingLimit,
  expenses,
  categories,
  expensesByCategory,
  categoryBudgets,
  loading,
  filter,
  filteredExpenses,
  totalExpenses,
  savings,
  savingsProgress,
  budgetPercentage,
  isOverBudget,
  suggestion,
  fetchData,
  setFilter,
  onSuccessMessage,
  onErrorMessage
}) => {
  // Initialize management hooks with callback objects
  const {
    addExpense,
    deleteExpenses
  } = useExpenseManagement({
    onSuccess: onSuccessMessage,
    onError: onErrorMessage,
    onUpdate: fetchData
  });

  const {
    loading: incomeLoading,
    addIncome,
    deleteIncome,
    updateIncome
  } = useIncomeManagement({
    onSuccess: onSuccessMessage,
    onError: onErrorMessage,
    onUpdate: fetchData
  });

  const {
    updateBudget,
    updateSavingsGoal
  } = useBudgetManagement({
    onSuccess: onSuccessMessage,
    onError: onErrorMessage,
    onUpdate: fetchData
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-4">
      {/* Notification messages are now managed at the App level */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Insights */}
        <FinancialInsights
          expensesByCategory={expensesByCategory}
          totalExpenses={totalExpenses}
          income={income}
          savings={savings}
          isOverBudget={isOverBudget}
          spendingLimit={spendingLimit}
          suggestion={suggestion}
          onApplySuggestion={(limit) => updateBudget('Total', limit, '/budgets', 'limit_amount')}
        />

        {/* Expense Distribution */}
        <ExpenseDistribution
          expensesByCategory={expensesByCategory}
          totalExpenses={totalExpenses}
        />

        {/* Category Budget Manager */}
        <CategoryBudgetManager
          categories={categories}
          expensesByCategory={expensesByCategory}
          categoryBudgets={categoryBudgets}
          onUpdateBudget={updateBudget}
          onSaveBudget={updateBudget}
        />

        {/* Financial Summary */}
        <FinancialSummary
          income={income}
          totalExpenses={totalExpenses}
          savings={savings}
          budgetPercentage={budgetPercentage}
          isOverBudget={isOverBudget}
          savingsProgress={savingsProgress}
          savingsGoal={savingsGoal}
          incomes={incomes}
          onAddIncome={addIncome}
          onDeleteIncome={deleteIncome}
        />

        {/* Income Goals */}
        <IncomeGoals
          income={income}
          setIncome={updateIncome}
          spendingLimit={spendingLimit}
          savingsGoal={savingsGoal}
          expensesByCategory={expensesByCategory}
          incomes={incomes}
          setSpendingLimit={(limit) => updateBudget('Total', limit)}
          setSavingsGoal={updateSavingsGoal}
          onSuccessMessage={onSuccessMessage}
          onErrorMessage={onErrorMessage}
        />

        {/* Add Expense, Delete Expenses, and Filter Expenses */}
        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Manage Financials</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add New Expense */}
            <AddExpenseForm
              categories={categories}
              onAddExpense={(data: ExpenseForm) => addExpense(data)}
            />

            {/* Delete Expense */}
            <DeleteExpenses
              onSuccess={onSuccessMessage}
              onError={onErrorMessage}
            />

            {/* Filter Expenses */}
            <ExpenseFilter
              filter={filter}
              setFilter={setFilter}
              categories={categories}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;