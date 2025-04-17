import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import api from '../utils/api'; 
import DataCleanup from './DataCleanup';

const DashboardContainer = () => {
  // Define the state variables with useState
  const [expenses, setExpenses] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState({});
  const [categories, setCategories] = useState(['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment']);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories and expenses
        const [fetchedCategories, fetchedExpenses] = await Promise.all([
          api.get('/categories'),
          api.get('/expenses')
        ]);

        if (Array.isArray(fetchedCategories) && fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
        }

        if (Array.isArray(fetchedExpenses)) {
          setExpenses(fetchedExpenses);

          // Calculate expenses by category
          const expByCat = {};
          fetchedExpenses.forEach(expense => {
            if (!expByCat[expense.category]) {
              expByCat[expense.category] = 0;
            }
            expByCat[expense.category] += parseFloat(expense.amount);
          });

          setExpensesByCategory(expByCat);
        }
      } catch (error) {
        console.error('Failed to load data', error);
        setErrorMessage('Failed to load expenses');
      }
    };

    loadData();
  }, []);

  const handleSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleErrorMessage = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {successMessage && (
        <div className="col-span-full bg-green-100 text-green-700 p-4 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="col-span-full bg-red-100 text-red-700 p-4 rounded">
          {errorMessage}
        </div>
      )}

      <Dashboard
        expenses={expenses}
        expensesByCategory={expensesByCategory}
        categories={categories}
        onSuccessMessage={handleSuccessMessage}
        onErrorMessage={handleErrorMessage}
      />

      <div className="col-span-full mt-6">
        <DataCleanup
          onSuccess={(msg) => handleSuccessMessage(msg)}
          onError={(msg) => handleErrorMessage(msg)}
        />
      </div>
    </div>
  );
};

export default DashboardContainer;