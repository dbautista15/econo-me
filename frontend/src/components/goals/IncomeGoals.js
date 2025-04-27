import React, { useState } from 'react';
import { calculateSavings, calculateBudgetStatus, getSuggestedLimit } from '../../utils/helpers';
import { useCategories } from '../../context/CategoryContext';
import api from '../../utils/api';
import { Section, Input, SubmitButton, Progress, Insight } from '../ui';

const IncomeGoals = ({
  income = 0,
  setIncome,
  spendingLimit = 0,
  setSpendingLimit,
  savingsGoal = 0,
  setSavingsGoal,
  expensesByCategory = {},
  categoryBudgets = {},
  setCategoryBudgets,
  onSuccessMessage = () => {},
  onErrorMessage = () => {},
  incomes = [],
  refreshIncomes = () => {},
}) => {
  const [loading, setLoading] = useState(false);
  const { categories } = useCategories();

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + (val || 0), 0);
  const savings = calculateSavings(income, totalExpenses);
  const { isOverBudget } = calculateBudgetStatus(totalExpenses, spendingLimit);
  const suggestion = getSuggestedLimit(incomes);

  const handleApiError = (msg, error) => {
    console.error(msg, error);
    onErrorMessage(`${msg}: ${error.message}`);
    setLoading(false);
  };

  const handleUpdateSpendingLimit = async (e) => {
    e.preventDefault();
    const newLimit = parseFloat(e.target.limit.value);
    setLoading(true);

    try {
      const res = await api.get('/budgets');
      const total = res.data.find(b => b.category === 'Total');

      total
        ? await api.put(`/budgets/${total.id}`, { limit: newLimit })
        : await api.post('/budgets', { category: 'Total', limit: newLimit });

      setSpendingLimit(newLimit);
      onSuccessMessage('Spending limit updated successfully!');
    } catch (err) {
      handleApiError('Error updating spending limit', err);
    }
  };

  const handleUpdateSavingsGoal = async (e) => {
    e.preventDefault();
    const newGoal = parseFloat(e.target.goal.value);
    setLoading(true);

    try {
      const res = await api.get('/savings-goals');
      const latest = res.data[0];

      latest
        ? await api.put(`/savings-goals/${latest.id}`, { target_amount: newGoal })
        : await api.post('/savings-goals', {
            name: 'Monthly Savings',
            target_amount: newGoal,
            current_amount: savings,
            target_date: null
          });

      setSavingsGoal(newGoal);
      onSuccessMessage('Savings goal updated successfully!');
    } catch (err) {
      handleApiError('Error updating savings goal', err);
    }
  };

  const updateCategoryBudget = async (category, amount) => {
    try {
      const res = await api.get('/budgets');
      const existing = res.data.find(b => b.category === category);

      existing
        ? await api.put(`/budgets/${existing.id}`, { limit: amount })
        : await api.post('/budgets', { category, limit: amount });

      setCategoryBudgets(prev => ({ ...prev, [category]: parseFloat(amount) }));
      onSuccessMessage(`${category} budget updated successfully!`);
    } catch (err) {
      handleApiError(`Error updating budget for ${category}`, err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <Section title="Set Spending Limit">
        <form onSubmit={handleUpdateSpendingLimit}>
          <Input label="Monthly Spending Limit ($)" name="limit" type="number" defaultValue={spendingLimit} />
          <SubmitButton loading={loading} text="Update Spending Limit" />
        </form>
      </Section>

      <Section title="Set Savings Goal">
        <form onSubmit={handleUpdateSavingsGoal}>
          <Input label="Monthly Savings Goal ($)" name="goal" type="number" defaultValue={savingsGoal} />
          <SubmitButton loading={loading} text="Update Savings Goal" />
        </form>
      </Section>

      {suggestion && (
        <div className="mt-6 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-md md:col-span-2">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Suggested Spending Limit</h3>
          <ul className="list-disc list-inside ml-4 text-yellow-900 text-sm mt-2">
            <li><strong>Pay frequency:</strong> {suggestion.frequency}</li>
            <li><strong>Next paycheck:</strong> {suggestion.nextDate}</li>
            <li><strong>Recommended daily limit:</strong> ${suggestion.daily}</li>
          </ul>
          <button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
            onClick={() => setSpendingLimit(parseFloat(suggestion.daily) * 7)}
          >
            Apply Suggested Weekly Limit
          </button>
        </div>
      )}

    </div>
  );
};

export default IncomeGoals;
