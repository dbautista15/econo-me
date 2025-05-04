import React, { useState } from 'react';
import { transformations } from '../../utils/transformations';

interface BasicIncomeFormProps {
  currentIncome: number;
  onSubmit: (value: number) => void;
  loading: boolean;
}

/**
 * Simple form for updating monthly income total
 */
export const BasicIncomeForm: React.FC<BasicIncomeFormProps> = ({
  currentIncome,
  onSubmit,
  loading
}) => {
  const [income, setIncome] = useState(currentIncome.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
	e.preventDefault();
	const parsedValue = transformations.parseAmount(income);
	if (parsedValue > 0) {
	  onSubmit(parsedValue);
	  setIsEditing(false);
	}
  };

  return (
	<div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
	  <h3 className="text-lg font-medium mb-2">Monthly Income</h3>
	  
	  {isEditing ? (
		<form onSubmit={handleSubmit} className="space-y-4">
		  <div>
			<label htmlFor="income" className="block text-sm font-medium text-gray-700">
			  Enter your monthly income
			</label>
			<div className="mt-1 relative rounded-md shadow-sm">
			  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<span className="text-gray-500 sm:text-sm">$</span>
			  </div>
			  <input
				type="number"
				id="income"
				className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 pr-12 sm:text-sm border-gray-300 rounded-md"
				placeholder="0.00"
				step="0.01"
				min="0"
				value={income}
				onChange={(e) => setIncome(e.target.value)}
				required
			  />
			</div>
		  </div>
		  <div className="flex space-x-2">
			<button
			  type="submit"
			  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
			  disabled={loading}
			>
			  {loading ? 'Saving...' : 'Save Income'}
			</button>
			<button
			  type="button"
			  className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded text-sm"
			  onClick={() => {
				setIncome(currentIncome.toString());
				setIsEditing(false);
			  }}
			>
			  Cancel
			</button>
		  </div>
		</form>
	  ) : (
		<div className="flex justify-between items-center">
		  <div>
			<p className="text-gray-600 text-sm">Current Monthly Income</p>
			<p className="text-xl font-semibold">${transformations.formatCurrency(currentIncome)}</p>
		  </div>
		  <button
			onClick={() => setIsEditing(true)}
			className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-3 rounded text-sm"
		  >
			Update
		  </button>
		</div>
	  )}
	</div>
  );
};