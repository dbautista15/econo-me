import React, { useState, useEffect } from 'react';
import { renderBarChart } from './Charts';
import { validateExpenseForm, preparePieChartData } from '../utils/helpers';
import { addExpense } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const ExpenseTracker = ({
	categories,
	expenses,
	expensesByCategory,
	colors,
	onExpensesChange
}) => {
	const [loading, setLoading] = useState(false);
	const [category, setCategory] = useState('Food');
	const [amount, setAmount] = useState('');
	const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
	const [formErrors, setFormErrors] = useState({});
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('All');
	const [filteredExpenses, setFilteredExpenses] = useState([]);
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	// Filter expenses when filters or expenses change
	useEffect(() => {
		let filtered = [...expenses];

		// Filter by date range
		if (startDate) {
			filtered = filtered.filter(expense => {
				if (!expense.date) return false;
				return new Date(expense.date) >= new Date(startDate);
			});
		}

		if (endDate) {
			filtered = filtered.filter(expense => {
				if (!expense.date) return false;
				return new Date(expense.date) <= new Date(endDate);
			});
		}

		// Filter by category
		if (categoryFilter !== 'All') {
			filtered = filtered.filter(expense => expense.category === categoryFilter);
		}

		setFilteredExpenses(filtered);
	}, [expenses, startDate, endDate, categoryFilter]);

	const handleAddExpense = async (e) => {
		e.preventDefault();

		// Validate form
		const errors = validateExpenseForm(amount, expenseDate);

		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			return;
		}

		// Clear any previous errors
		setFormErrors({});
		setLoading(true);

		try {
			await addExpense({
				category,
				amount: parseFloat(amount),
				date: expenseDate
			});

			// Refresh expenses through parent component
			onExpensesChange();

			// Show success message
			setSuccessMessage('Expense added successfully!');
			setTimeout(() => setSuccessMessage(''), 3000);

			// Reset form
			setAmount('');
			setExpenseDate(new Date().toISOString().split('T')[0]);
		} catch (error) {
			setErrorMessage(`Failed to add expense: ${error.message}`);
			setTimeout(() => setErrorMessage(''), 3000);
		} finally {
			setLoading(false);
		}
	};

	const pieChartData = preparePieChartData(expensesByCategory);

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			{/* Notification Messages */}
			{successMessage && (
				<div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md md:col-span-3">
					{successMessage}
				</div>
			)}
			{errorMessage && (
				<div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md md:col-span-3">
					{errorMessage}
				</div>
			)}

			{/* Add Expense Form */}
			<div className="bg-white p-6 rounded-lg shadow-md">
				<h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
				<form onSubmit={handleAddExpense}>
					<div className="mb-4">
						<label className="block text-gray-700 mb-2" htmlFor="expenseDate">
							Date
						</label>
						<input
							id="expenseDate"
							type="date"
							className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={expenseDate}
							onChange={(e) => setExpenseDate(e.target.value)}
							required
						/>
						{formErrors.date && (
							<p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
						)}
					</div>
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
						{formErrors.amount && (
							<p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
						)}
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

			{/* Filters */}
			<div className="mb-6 bg-gray-50 p-4 rounded-lg">
				<h3 className="text-lg font-medium mb-3">Filter Expenses</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block text-gray-700 text-sm mb-1" htmlFor="startDate">
							From
						</label>
						<input
							id="startDate"
							type="date"
							className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
						/>
					</div>
					<div>
						<label className="block text-gray-700 text-sm mb-1" htmlFor="endDate">
							To
						</label>
						<input
							id="endDate"
							type="date"
							className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
						/>
					</div>
					<div>
						<label className="block text-gray-700 text-sm mb-1" htmlFor="categoryFilter">
							Category
						</label>
						<select
							id="categoryFilter"
							className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(e.target.value)}
						>
							<option value="All">All Categories</option>
							{categories.map(cat => (
								<option key={cat} value={cat}>{cat}</option>
							))}
						</select>
					</div>
				</div>
				<div className="mt-4 flex justify-end">
					<button
						className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md mr-2"
						onClick={() => {
							setStartDate('');
							setEndDate('');
							setCategoryFilter('All');
						}}
					>
						Clear Filters
					</button>
				</div>
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
									<th className="px-4 py-2 text-left">Date</th>
									<th className="px-4 py-2 text-left">Category</th>
									<th className="px-4 py-2 text-right">Amount</th>
								</tr>
							</thead>
							<tbody>
								{filteredExpenses.length > 0 ? (
									filteredExpenses.map((expense, index) => (
										<tr key={index} className="border-t">
											<td className="px-4 py-3">
												{expense.date
													? new Date(expense.date).toLocaleDateString()
													: 'N/A'}
											</td>
											<td className="px-4 py-3">{expense.category}</td>
											<td className="px-4 py-3 text-right">${(+expense.amount).toFixed(2)}</td>
										</tr>))
								) : (
									<tr>
										<td colSpan="3" className="px-4 py-6 text-center text-gray-500">
											No expenses match your filters.
										</td>
									</tr>
								)}
							</tbody>
							<tfoot>
								<tr className="border-t font-semibold">
									<td className="px-4 py-3" colSpan="2">Total</td>
									<td className="px-4 py-3 text-right">
										${filteredExpenses.reduce((sum, expense) => sum + (+expense.amount), 0).toFixed(2)}                  </td>
								</tr>
							</tfoot>
						</table>
					</div>
				)}
			</div>

			{/* Category Breakdown */}
			<div className="bg-white p-6 rounded-lg shadow-md md:col-span-3">
				<h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
				{renderBarChart(pieChartData, colors)}
				<div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
					{pieChartData.map((category, index) => (
						<div key={index} className="p-4 bg-blue-50 rounded-md">
							<h3 className="text-sm text-gray-500">{category.name}</h3>
							<p className="text-xl font-bold text-gray-800">${(+category.value).toFixed(2)}</p>
						</div>
					))}        </div>
			</div>
		</div>
	);
};

export default ExpenseTracker;