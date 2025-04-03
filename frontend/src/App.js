import React, { useState, useEffect } from 'react';
const App = () => {
    // State for various data
    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState(0);
    const [spendingLimit, setSpendingLimit] = useState(0);
    const [savingsGoal, setSavingsGoal] = useState(0);
    const [category, setCategory] = useState('Food');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Predefined categories
    const categories = ['Food', 'Gas', 'MortgageRent', 'Utilities', 'Wants'];

    // Mock data for charts (would be replaced with real data from API)
    const [expensesByCategory, setExpensesByCategory] = useState({
        Food: 0,
        Gas: 0,
        MortgageRent: 0,
        Utilities: 0,
        Wants: 0
    });

    // Sample monthly data for trends
    const monthlyData = [
        { name: 'Jan', expenses: 1200, income: 3000 },
        { name: 'Feb', expenses: 1350, income: 3000 },
        { name: 'Mar', expenses: 1100, income: 3100 },
        { name: 'Apr', expenses: 1550, income: 3100 },
        { name: 'May', expenses: 1300, income: 3200 },
        { name: 'Jun', expenses: 1250, income: 3200 },
    ];

    // API base URL
    const API_BASE_URL = 'http://localhost:5002/api';

    // Fetch expenses when component mounts
    useEffect(() => {
        fetchExpenses();
        fetchBudgets();
    }, []);

    // Function to fetch expenses from the API
    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/expenses`);
            if (!response.ok) {
                throw new Error('Failed to fetch expenses');
            }
            const data = await response.json();
            setExpenses(data);

            // Update expenses by category
            const categoryTotals = {
                Food: 0,
                Gas: 0,
                MortgageRent: 0,
                Utilities: 0,
                Wants: 0
            };

            data.forEach(expense => {
                categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + parseFloat(expense.amount);
            });

            setExpensesByCategory(categoryTotals);
        } catch (error) {
            showMessage(`Error fetching expenses: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch budgets from the API
    const fetchBudgets = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/budgets`);
            if (!response.ok) {
                throw new Error('Failed to fetch budgets');
            }
            const data = await response.json();

            // Set spending limit based on total of all budget limits
            if (data.length > 0) {
                const totalLimit = data.reduce((sum, budget) => sum + parseFloat(budget.limit_amount), 0);
                setSpendingLimit(totalLimit);
            }
        } catch (error) {
            showMessage(`Error fetching budgets: ${error.message}`, 'error');
        }
    };

// Function to add a new expense
const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
        showMessage('Please enter a valid amount', 'error');
        return;
    }

    setLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, amount: parseFloat(amount) })
        });

        if (!response.ok) {
            throw new Error('Failed to add expense');
        }

        // Refresh expenses after adding new one
        fetchExpenses();
        showMessage('Expense added successfully!', 'success');
        setAmount('');
    } catch (error) {
        showMessage(`Failed to add expense: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
};
    // Helper for showing messages
    const showMessage = (message, type) => {
        if (type === 'success') {
            setSuccessMessage(message);
            setTimeout(() => setSuccessMessage(''), 3000);
        } else {
            setErrorMessage(message);
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    // Function to update income
    const handleUpdateIncome = (e) => {
        e.preventDefault();
        setIncome(parseFloat(e.target.income.value));
        showMessage('Income updated successfully!', 'success');
    };

    // Function to update spending limit
    const handleUpdateSpendingLimit = async (e) => {
        e.preventDefault();
        const newLimit = parseFloat(e.target.limit.value);

        try {
            // First, check if a budget for "Total" exists
            const response = await fetch(`${API_BASE_URL}/budgets`);
            if (!response.ok) {
                throw new Error('Failed to fetch budgets');
            }

            const budgets = await response.json();
            const totalBudget = budgets.find(b => b.category === 'Total');

            let updateResponse;
            if (totalBudget) {
                // Update existing budget
                updateResponse = await fetch(`${API_BASE_URL}/budgets/${totalBudget.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ limit: newLimit })
                });
            } else {
                // Create new budget
                updateResponse = await fetch(`${API_BASE_URL}/budgets`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category: 'Total', limit: newLimit })
                });
            }

            if (!updateResponse.ok) {
                throw new Error('Failed to update spending limit');
            }

            setSpendingLimit(newLimit);
            showMessage('Spending limit updated successfully!', 'success');
        } catch (error) {
            showMessage(`Error updating spending limit: ${error.message}`, 'error');
        }
    };

    // Function to update savings goal
    const handleUpdateSavingsGoal = (e) => {
        e.preventDefault();
        setSavingsGoal(parseFloat(e.target.goal.value));
        showMessage('Savings goal updated successfully!', 'success');
    };

    // Convert expenses by category to chart data
    const pieChartData = Object.keys(expensesByCategory).map((key) => ({
        name: key,
        value: expensesByCategory[key]
    }));

    // Calculate totals
    const totalExpenses = Object.values(expensesByCategory).reduce((sum, value) => sum + value, 0);
    const savings = income - totalExpenses;
    const savingsProgress = savingsGoal > 0 ? (savings / savingsGoal) * 100 : 0;

    // Calculate percentage over/under budget
    const budgetPercentage = spendingLimit > 0 ? (totalExpenses / spendingLimit) * 100 : 0;
    const isOverBudget = budgetPercentage > 100;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-blue-600 text-white shadow-lg">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold">Econo-me</h1>
                    <p className="text-blue-100">Your Personal Finance Manager</p>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white shadow">
                <div className="container mx-auto px-4">
                    <nav className="flex">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-4 py-4 font-medium ${activeTab === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('expenses')}
                            className={`px-4 py-4 font-medium ${activeTab === 'expenses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                        >
                            Track Expenses
                        </button>
                        <button
                            onClick={() => setActiveTab('goals')}
                            className={`px-4 py-4 font-medium ${activeTab === 'goals' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                        >
                            Income & Goals
                        </button>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Notification Messages */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                        {errorMessage}
                    </div>
                )}

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Summary Cards */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-md">
                                    <h3 className="text-sm text-gray-500">Income</h3>
                                    <p className="text-2xl font-bold text-gray-800">${income.toFixed(2)}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-md">
                                    <h3 className="text-sm text-gray-500">Expenses</h3>
                                    <p className="text-2xl font-bold text-gray-800">${totalExpenses.toFixed(2)}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-md">
                                    <h3 className="text-sm text-gray-500">Savings</h3>
                                    <p className="text-2xl font-bold text-gray-800">${savings.toFixed(2)}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-md">
                                    <h3 className="text-sm text-gray-500">Budget Status</h3>
                                    <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                                        {budgetPercentage.toFixed(0)}%
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-sm text-gray-500 mb-2">Savings Goal Progress</h3>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div
                                        className="bg-blue-600 h-4 rounded-full"
                                        style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{savingsProgress.toFixed(0)}% of ${savingsGoal}</p>
                            </div>
                        </div>

                        {/* Rest of your UI remains the same */}
                        {/* ... */}

                        {/* Expense Distribution */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Expense Distribution</h2>
                            <div className="h-64 flex flex-col justify-center">
                                <div className="text-center text-gray-500">
                                    <p>Pie chart visualization will appear here after installing recharts.</p>
                                    <p className="mt-2 text-sm">Run: npm install recharts</p>
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-medium text-gray-700 mb-2">Category Breakdown:</h3>
                                    <ul className="space-y-2">
                                        {pieChartData.map((entry, index) => (
                                            <li key={index} className="flex justify-between">
                                                <span>{entry.name}</span>
                                                <span className="font-medium">${entry.value.toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Trends */}
                        <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
                            <h2 className="text-xl font-semibold mb-4">Monthly Trends</h2>
                            <div className="h-64 flex flex-col justify-center">
                                <div className="text-center text-gray-500 mb-4">
                                    <p>Line chart visualization will appear here after installing recharts.</p>
                                    <p className="mt-2 text-sm">Run: npm install recharts</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-2 text-left">Month</th>
                                                <th className="px-4 py-2 text-right">Income</th>
                                                <th className="px-4 py-2 text-right">Expenses</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthlyData.map((month, index) => (
                                                <tr key={index} className="border-t">
                                                    <td className="px-4 py-2">{month.name}</td>
                                                    <td className="px-4 py-2 text-right">${month.income.toFixed(2)}</td>
                                                    <td className="px-4 py-2 text-right">${month.expenses.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Expenses Tab */}
                {activeTab === 'expenses' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Add Expense Form */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
                            <form onSubmit={handleAddExpense}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2" htmlFor="category">
                                        Category
                                    </label>
                                    <select
                                        id="category"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2" htmlFor="amount">
                                        Amount ($)
                                    </label>
                                    <input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    disabled={loading}
                                >
                                    {loading ? 'Adding...' : 'Add Expense'}
                                </button>
                            </form>
                        </div>

                        {/* Recent Expenses */}
                        <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
                            <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
                            {expenses.length === 0 ? (
                                <p className="text-gray-500">No expenses recorded yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-2 text-left">Category</th>
                                                <th className="px-4 py-2 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenses.map((expense, index) => (
                                                <tr key={index} className="border-t">
                                                    <td className="px-4 py-3">{expense.category}</td>
                                                    <td className="px-4 py-3 text-right">${expense.amount.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t font-semibold">
                                                <td className="px-4 py-3">Total</td>
                                                <td className="px-4 py-3 text-right">
                                                    ${totalExpenses.toFixed(2)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Category Breakdown */}
                        <div className="bg-white p-6 rounded-lg shadow-md md:col-span-3">
                            <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
                            <div className="h-64 flex flex-col justify-center">
                                <div className="text-center text-gray-500 mb-4">
                                    <p>Bar chart visualization will appear here after installing recharts.</p>
                                    <p className="mt-2 text-sm">Run: npm install recharts</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    {pieChartData.map((category, index) => (
                                        <div key={index} className="p-4 bg-blue-50 rounded-md">
                                            <h3 className="text-sm text-gray-500">{category.name}</h3>
                                            <p className="text-xl font-bold text-gray-800">${category.value.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Income & Goals Tab */}
                {activeTab === 'goals' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Update Income */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Update Income</h2>
                            <form onSubmit={handleUpdateIncome}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2" htmlFor="income">
                                        Monthly Income ($)
                                    </label>
                                    <input
                                        id="income"
                                        name="income"
                                        type="number"
                                        step="0.01"
                                        defaultValue={income}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Update Income
                                </button>
                            </form>
                        </div>

                        {/* Set Spending Limit */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Set Spending Limit</h2>
                            <form onSubmit={handleUpdateSpendingLimit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2" htmlFor="limit">
                                        Monthly Spending Limit ($)
                                    </label>
                                    <input
                                        id="limit"
                                        name="limit"
                                        type="number"
                                        step="0.01"
                                        defaultValue={spendingLimit}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Update Spending Limit
                                </button>
                            </form>
                        </div>

                        {/* Set Savings Goal */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Set Savings Goal</h2>
                            <form onSubmit={handleUpdateSavingsGoal}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2" htmlFor="goal">
                                        Monthly Savings Goal ($)
                                    </label>
                                    <input
                                        id="goal"
                                        name="goal"
                                        type="number"
                                        step="0.01"
                                        defaultValue={savingsGoal}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Update Savings Goal
                                </button>
                            </form>
                        </div>

                        {/* Financial Insights */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Financial Insights</h2>
                            {income > 0 ? (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium text-gray-700">Income Allocation</h3>
                                        <div className="mt-2 space-y-2">
                                            <div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Expenses</span>
                                                    <span>{income > 0 ? ((totalExpenses / income) * 100).toFixed(0) : 0}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div
                                                        className="bg-red-500 h-2 rounded-full"
                                                        style={{ width: `${income > 0 ? Math.min((totalExpenses / income) * 100, 100) : 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Savings</span>
                                                    <span>{income > 0 ? ((savings / income) * 100).toFixed(0) : 0}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full"
                                                        style={{ width: `${income > 0 ? Math.max((savings / income) * 100, 0) : 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <h3 className="font-medium text-gray-700">Budget Status</h3>
                                        <p className={`mt-2 ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                                            {isOverBudget
                                                ? `You are $${(totalExpenses - spendingLimit).toFixed(2)} over your budget.`
                                                : `You are $${(spendingLimit - totalExpenses).toFixed(2)} under your budget.`}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <h3 className="font-medium text-gray-700">Savings Goal</h3>
                                        <p className="mt-2">
                                            {savings >= savingsGoal
                                                ? `Congratulations! You've met your savings goal of $${savingsGoal.toFixed(2)}.`
                                                : `You need $${(savingsGoal - savings).toFixed(2)} more to reach your goal.`}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">Please set your income to see financial insights.</p>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white mt-12">
                <div className="container mx-auto px-4 py-6">
                    <p className="text-center text-gray-400">© 2025 Econo-me. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default App;