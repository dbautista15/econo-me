import React, { useState } from 'react';
import { calculateSavings, calculateBudgetStatus } from '../utils/helpers';
import { fetchBudgets, updateBudget, createBudget } from '../utils/api';

const IncomeGoals = ({
	income,
	setIncome,
	spendingLimit,
	setSpendingLimit,
	savingsGoal,
	setSavingsGoal,
	expensesByCategory,
	categoryBudgets,
	setCategoryBudgets,
	categories,
	onSuccessMessage,
	onErrorMessage
}) => {
	const [loading, setLoading] = useState(false);

	const totalExpenses = Object.values(expensesByCategory).reduce((sum, value) => sum + value, 0);
	const savings = calculateSavings(income, totalExpenses);
	const { isOverBudget } = calculateBudgetStatus(totalExpenses, spendingLimit);

	const handleUpdateIncome = (e) => {
		e.preventDefault();
		const newIncome = parseFloat(e.target.income.value);
		setIncome(newIncome);
		onSuccessMessage('Income updated successfully!');
	};

	const handleUpdateSpendingLimit = async (e) => {
		e.preventDefault();
		const newLimit = parseFloat(e.target.limit.value);
		setLoading(true);

		try {
			// First, check if a budget for "Total" exists
			const budgets = await fetchBudgets();
			const totalBudget = budgets.find(b => b.category === 'Total');

			if (totalBudget) {
				await updateBudget(totalBudget.id, newLimit);
			} else {
				await createBudget('Total', newLimit);
			}

			setSpendingLimit(newLimit);
			onSuccessMessage('Spending limit updated successfully!');
		} catch (error) {
			onErrorMessage(`Error updating spending limit: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateSavingsGoal = (e) => {
		e.preventDefault();
		const newGoal = parseFloat(e.target.goal.value);
		setSavingsGoal(newGoal);
		onSuccessMessage('Savings goal updated successfully!');
	};

	const updateCategoryBudget = async (category, amount) => {
		try {
		  // Check if budget exists for this category
		  const budgets = await fetchBudgets();
		  const existingBudget = budgets.find(b => b.category === category);
		  
		  if (existingBudget) {
			// Update existing budget
			await updateBudget(existingBudget.id, amount);
		  } else {
			// Create new budget
			await createBudget(category, amount);
		  }
		  
		  // Update local state
		  setCategoryBudgets(prev => ({
			...prev,
			[category]: parseFloat(amount)
		  }));
		  
		  onSuccessMessage(`${category} budget updated successfully!`);
		  return true;
		} catch (error) {
		  onErrorMessage(`Error updating budget: ${error.message}`);
		  return false;
		}
	  };
	return (
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
						disabled={loading}
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

			{/* Category Budget Management */}
			<div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
				<h2 className="text-xl font-semibold mb-4">Category Budget Management</h2>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="bg-gray-50">
								<th className="px-4 py-2 text-left">Category</th>
								<th className="px-4 py-2 text-left">Current Spending</th>
								<th className="px-4 py-2 text-left">Monthly Budget</th>
								<th className="px-4 py-2 text-right">Status</th>
								<th className="px-4 py-2 text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{categories.map((cat) => {
								const spent = expensesByCategory[cat] || 0;
								const budget = categoryBudgets[cat] || 0;
								const percentage = budget > 0 ? (spent / budget) * 100 : 0;
								const status = percentage > 100 ? 'Over Budget' : percentage > 80 ? 'Near Limit' : 'On Track';
								const statusColor = percentage > 100 ? 'text-red-600' : percentage > 80 ? 'text-yellow-600' : 'text-green-600';

								return (
									<tr key={cat} className="border-t">
										<td className="px-4 py-3">{cat}</td>
										<td className="px-4 py-3">${spent.toFixed(2)}</td>
										<td className="px-4 py-3">
											<input
												type="number"
												min="0"
												step="0.01"
												className="w-24 p-1 border border-gray-300 rounded"
												value={budget}
												onChange={(e) => {
													const newBudgets = { ...categoryBudgets };
													newBudgets[cat] = parseFloat(e.target.value) || 0;
													setCategoryBudgets(newBudgets);
												}}
											/>
										</td>
										<td className={`px-4 py-3 text-right ${statusColor} font-medium`}>
											{status} ({percentage.toFixed(0)}%)
										</td>
										<td className="px-4 py-3 text-right">
											<button
												className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
												onClick={() => updateCategoryBudget(cat, categoryBudgets[cat])}
											>
												Save
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default IncomeGoals;