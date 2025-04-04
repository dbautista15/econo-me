import React, { useState } from 'react';
import Dashboard from './Dashboard';
import IncomeGoals from './IncomeGoals';

const DashboardContainer = () => {
  const [income, setIncome] = useState(0);
  const [spendingLimit, setSpendingLimit] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState({});

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleErrorMessage = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        income={income}
        spendingLimit={spendingLimit}
        savingsGoal={savingsGoal}
        expenses={expenses}
        expensesByCategory={expensesByCategory}
      />
      
      <IncomeGoals 
        income={income}
        setIncome={setIncome}
        spendingLimit={spendingLimit}
        setSpendingLimit={setSpendingLimit}
        savingsGoal={savingsGoal}
        setSavingsGoal={setSavingsGoal}
        expensesByCategory={expensesByCategory}
        onSuccessMessage={handleSuccessMessage}
        onErrorMessage={handleErrorMessage}
      />
    </div>
  );
};

export default DashboardContainer;