import React, { useState, useEffect} from 'react';
import { renderPieChart, renderLineChart, renderStackedBarChart } from './Charts';
import { calculateSavings, calculateBudgetStatus, preparePieChartData, prepareMonthlyBreakdownData } from '../utils/helpers';
import { fetchCategories } from '../utils/api'; // Add this import

const Dashboard = ({
	income = 0,
	expenses = [],
	expensesByCategory = {},
	monthlyData = [],
	spendingLimit = 0,
	savingsGoal = 0,
	categories: initialCategories = [],
	colors = []
}) => {
	const [categories, setCategories] = useState(['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment']);
	const totalExpenses = expensesByCategory
		? Object.values(expensesByCategory).reduce((sum, value) => sum + value, 0)
		: 0; const savings = calculateSavings(income, totalExpenses);
	const savingsProgress = savingsGoal > 0 ? (savings / savingsGoal) * 100 : 0;
	const { budgetPercentage, isOverBudget } = calculateBudgetStatus(totalExpenses, spendingLimit);
	const pieChartData = preparePieChartData(expensesByCategory);
	const monthlyBreakdownData = prepareMonthlyBreakdownData(expenses, categories);
	useEffect(() => {
		const loadCategories = async () => {
			try {
				const fetchedCategories = await fetchCategories();
				setCategories(fetchedCategories);
			} catch (error) {
				console.error('Failed to load categories', error);
				// Fallback to default categories
			}
		};

		loadCategories();
	}, []);
	// MonthlyBreakdown sub-component 
	const MonthlyBreakdown = () => {
		return renderStackedBarChart(monthlyBreakdownData, categories, colors);
	};

	return (
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

			{/* Expense Distribution */}
			<div className="bg-white p-6 rounded-lg shadow-md">
				<h2 className="text-xl font-semibold mb-4">Expense Distribution</h2>
				{renderPieChart(pieChartData, colors)}
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

			{/* Monthly Trends */}
			<div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
				<h2 className="text-xl font-semibold mb-4">Monthly Trends</h2>
				{renderLineChart(monthlyData)}
			</div>

			{/* Monthly Expense Breakdown by Category */}
			<div className="bg-white p-6 rounded-lg shadow-md md:col-span-2 mt-6">
				<h2 className="text-xl font-semibold mb-4">Monthly Expense Breakdown by Category</h2>
				<MonthlyBreakdown />
			</div>
		</div>
	);
};

export default Dashboard;