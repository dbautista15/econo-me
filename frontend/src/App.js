import React, { useState, useEffect } from 'react';
import { Header, Navigation, NotificationMessage, Footer } from './components/Layout';
import Dashboard from './components/Dashboard';
import ExpenseTracker from './components/ExpenseTracker';
import IncomeGoals from './components/IncomeGoals';
import { fetchExpenses, fetchBudgets } from './utils/api';

const App = () => {
  // Constants
  const CATEGORIES = ['Food', 'Gas', 'MortgageRent', 'Utilities', 'Wants'];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];
  const API_BASE_URL = 'http://localhost:5002/api';

  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState(0);
  const [spendingLimit, setSpendingLimit] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [expensesByCategory, setExpensesByCategory] = useState({
    Food: 0,
    Gas: 0,
    MortgageRent: 0,
    Utilities: 0,
    Wants: 0
  });
  const [monthlyData, setMonthlyData] = useState([
    { name: 'Jan', expenses: 1200, income: 3000 },
    { name: 'Feb', expenses: 1350, income: 3000 },
    { name: 'Mar', expenses: 1100, income: 3100 },
    { name: 'Apr', expenses: 1550, income: 3100 },
    { name: 'May', expenses: 1300, income: 3200 },
    { name: 'Jun', expenses: 1250, income: 3200 },
  ]);
  const [categoryBudgets, setCategoryBudgets] = useState({
    Food: 0,
    Gas: 0,
    MortgageRent: 0,
    Utilities: 0,
    Wants: 0
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch data when component mounts
  useEffect(() => {
    loadExpenses();
    loadBudgets();
  }, []);

  // Update income in monthly data when income changes
  useEffect(() => {
    if (monthlyData.length > 0) {
      const updatedMonthlyData = monthlyData.map(month => ({
        ...month,
        income: income
      }));
      setMonthlyData(updatedMonthlyData);
    }
  }, [income]);

  // Load expenses data
  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await fetchExpenses();
      setExpenses(data);

      // Update expenses by category
      const categoryTotals = {
        Food: 0,
        Gas: 0,
        MortgageRent: 0,
        Utilities: 0,
        Wants: 0
      };

      // Group expenses by month for trend data
      const expensesByMonth = {};

      data.forEach(expense => {
        // Update category totals
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + parseFloat(expense.amount);

        // Extract month from expense date if available, or use current month
        const expenseDate = expense.date ? new Date(expense.date) : new Date();
        const monthYear = `${expenseDate.toLocaleString('default', { month: 'short' })}-${expenseDate.getFullYear()}`;

        if (!expensesByMonth[monthYear]) {
          expensesByMonth[monthYear] = 0;
        }
        expensesByMonth[monthYear] += parseFloat(expense.amount);
      });

      setExpensesByCategory(categoryTotals);

      // Update monthly trend data
      const trendData = Object.keys(expensesByMonth).map(month => ({
        name: month,
        expenses: expensesByMonth[month],
        income: income // Use current income value for historical months too
      }));

      // Sort by date
      trendData.sort((a, b) => {
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA - dateB;
      });

      // Update monthly data state if we have data
      if (trendData.length > 0) {
        setMonthlyData(trendData);
      }
    } catch (error) {
      showMessage(`Error fetching expenses: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load budgets data
  const loadBudgets = async () => {
    try {
      const data = await fetchBudgets();

      // Set spending limit based on total budget
      if (data.length > 0) {
        const totalBudget = data.find(b => b.category === 'Total');
        if (totalBudget) {
          setSpendingLimit(parseFloat(totalBudget.limit_amount));
        }
      }

      // Process category budgets
      const budgets = {
        Food: 0,
        Gas: 0,
        MortgageRent: 0,
        Utilities: 0,
        Wants: 0
      };

      data.forEach(budget => {
        if (CATEGORIES.includes(budget.category)) {
          budgets[budget.category] = parseFloat(budget.limit_amount);
        }
      });

      setCategoryBudgets(budgets);
    } catch (error) {
      showMessage(`Error fetching budgets: ${error.message}`, 'error');
    }
  };

  // Show notification messages
  const showMessage = (message, type) => {
    if (type === 'success') {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <Navigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="container mx-auto px-4 py-8">
        {successMessage && (
          <NotificationMessage message={successMessage} type="success" />
        )}
        
        {errorMessage && (
          <NotificationMessage message={errorMessage} type="error" />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard 
            income={income}
            expenses={expenses}
            expensesByCategory={expensesByCategory}
            monthlyData={monthlyData}
            spendingLimit={spendingLimit}
            savingsGoal={savingsGoal}
            categories={CATEGORIES}
            colors={COLORS}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseTracker 
            categories={CATEGORIES}
            expenses={expenses}
            expensesByCategory={expensesByCategory}
            colors={COLORS}
            loading={loading}
            onExpensesChange={loadExpenses}
          />
        )}

        {activeTab === 'goals' && (
          <IncomeGoals 
            income={income}
            setIncome={setIncome}
            spendingLimit={spendingLimit}
            setSpendingLimit={setSpendingLimit}
            savingsGoal={savingsGoal}
            setSavingsGoal={setSavingsGoal}
            expensesByCategory={expensesByCategory}
            categoryBudgets={categoryBudgets}
            setCategoryBudgets={setCategoryBudgets}
            categories={CATEGORIES}
            onSuccessMessage={(msg) => showMessage(msg, 'success')}
            onErrorMessage={(msg) => showMessage(msg, 'error')}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;