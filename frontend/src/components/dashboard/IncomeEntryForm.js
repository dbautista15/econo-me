import React from 'react';

const IncomeEntryForm = ({ onAddIncome }) => {
	const handleSubmit = async (e) => {
		e.preventDefault();

		const amount = parseFloat(e.target.amount.value);
		const date = e.target.date.value;

		if (!amount || isNaN(amount)) {
			alert('Please enter a valid amount.');
			return;
		}

		if (!date || isNaN(new Date(date).getTime())) {
			alert('Please select a valid date.');
			return;
		}

		const success = await onAddIncome(amount, date);
		if (success) {
			e.target.reset();
		}
	};


	return (
		<div className="bg-white p-6 rounded-lg shadow-md">
			<h3 className="text-lg font-medium text-gray-700 mb-2">Add Income Entry</h3>
			<form onSubmit={handleSubmit}>
				<div className="grid grid-cols-2 gap-4 mb-2">
					<div>
						<label className="text-sm text-gray-600">Amount</label>
						<input
							name="amount"
							type="number"
							className="w-full p-2 border border-gray-300 rounded"
							required
						/>
					</div>
					<div>
						<label className="text-sm text-gray-600">Date</label>
						<input
							name="date"
							type="date"
							className="w-full p-2 border border-gray-300 rounded"
							defaultValue={new Date().toISOString().split('T')[0]}
							required
						/>
					</div>
				</div>
				<button
					type="submit"
					className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
				>
					Add Income
				</button>
			</form>
		</div>
	)}

export default IncomeEntryForm;