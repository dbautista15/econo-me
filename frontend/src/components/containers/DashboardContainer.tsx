import React, { useState, useEffect } from 'react';
import Dashboard from '../dashboard/Dashboard.tsx';
import DataCleanup from '../admin/DataCleanup.js';
import Alert from '../ui/Alert.tsx'; 
import api from '../../utils/api.tsx';

/**
 * DashboardContainer
 * 
 * - Fetches expenses and categories
 * - Passes structured data to children
 * - Manages success and error messages
 */
const DashboardContainer = () => {
  const [expenses, setExpenses] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState({});
  const [categories, setCategories] = useState([
    'Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment'
  ]);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [categoryRes, expenseRes] = await Promise.all([
        api.get('/categories'),
        api.get('/expenses')
      ]);

      const fetchedCategories = categoryRes.data || [];
      const fetchedExpenses = expenseRes.data || [];

      if (fetchedCategories.length > 0) setCategories(fetchedCategories);
      if (fetchedExpenses.length > 0) {
        setExpenses(fetchedExpenses);
        setExpensesByCategory(
          groupExpensesByCategory(fetchedExpenses)
        );
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      displayError('Failed to load expenses.');
    }
  };

  const groupExpensesByCategory = (expenses) => {
    return expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
      return acc;
    }, {});
  };

  const displaySuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const displayError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {successMessage && <Alert type="success" message={successMessage} />}
      {errorMessage && <Alert type="error" message={errorMessage} />}

      <Dashboard
        expenses={expenses}
        expensesByCategory={expensesByCategory}
        categories={categories}
        onSuccessMessage={displaySuccess}
        onErrorMessage={displayError}
      
      />

    </div>
  );
};

export default DashboardContainer;
