import React from 'react';

const FinancialSummary = ({
	income,
	totalExpenses,
	savings,
	budgetPercentage,
	isOverBudget,
	savingsProgress,
	savingsGoal,
	incomes,
	onAddIncome,
	onDeleteIncome, 
	selectedItems, 
	isLoading, 
	loading, 
	handleDeleteSelected
}) => {
	const handleSubmit = async (e) => {
		e.preventDefault();
		const amount = parseFloat(e.target.amount.value);
		const date = e.target.date.value;

		const success = await onAddIncome(amount, date);
		if (success) {
			e.target.reset();
		}
	};

	return (
		<div className="bg-white p-6 rounded-lg shadow-md">
			<h2 className="text-xl font-semibold mb-4">Financial Summary</h2>

			<div className="grid grid-cols-2 gap-4 mb-4">
				<div>
					<h3 className="text-sm text-gray-500">Current Income</h3>
					<div className="flex items-center">
						<p className="text-2xl font-bold">${income.toFixed(2)}</p>
					</div>
				</div>
				<div>
					<h3 className="text-sm text-gray-500">Current Expenses</h3>
					<div className="flex items-center">
						<p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
					</div>
				</div>

				<div>
					<h3 className="text-sm text-gray-500">Current Savings</h3>
					<p className="text-2xl font-bold">${savings.toFixed(2)}</p>
				</div>

				<div>
					<h3 className="text-sm text-gray-500">Budget Status</h3>
					<p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
						{budgetPercentage.toFixed(0)}%
					</p>
				</div>
			</div>

			<div>
				<div className="flex items-center mb-2">
					<h3 className="text-sm text-gray-500">Savings Goal Progress</h3>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-4">
					<div
						className={`h-4 rounded-full ${savingsProgress >= 100 ? 'bg-green-500' : 'bg-blue-600'}`}
						style={{ width: `${Math.min(savingsProgress, 100)}%` }}
					></div>
				</div>
				<p className="text-sm text-gray-600 mt-1">
					${savings.toFixed(2)} / ${savingsGoal.toFixed(2)}
				</p>
			</div>
		</div>
	);
};

export default FinancialSummary;