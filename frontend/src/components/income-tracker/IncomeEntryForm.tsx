import React, { FormEvent, ChangeEvent, useState } from 'react';
import api from '../../utils/api';  // Use the same API utility

interface IncomeForm {
  source: string;
  amount: string;
  date: string;
}

export interface IncomeEntryFormProps {
  onAddIncomeSuccess?: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const IncomeEntryForm: React.FC<IncomeEntryFormProps> = ({ 
  onAddIncomeSuccess
}) => {
  // Internal state management
  const [income, setIncome] = useState<IncomeForm>({
    source: 'Salary',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handler for updating form fields
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof IncomeForm
  ): void => {
    setIncome({
      ...income,
      [field]: e.target.value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Use the api utility like in DeleteExpenses
      await api.post('/incomes', {
        source: income.source,
        amount: parseFloat(income.amount),
        income_date: income.date
      });
      
      // Reset form on success
      setIncome({
        source: 'Salary',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      // Refresh data in parent component
      if (onAddIncomeSuccess) {
        onAddIncomeSuccess();
      }
    } catch (err) {
      console.error('Error adding income:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add New Income</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="source">
            Source
          </label>
          <input
            id="source"
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={income.source}
            onChange={(e) => handleInputChange(e, 'source')}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="amount">
            Amount ($)
          </label>
          <input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={income.amount}
            onChange={(e) => handleInputChange(e, 'amount')}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            type="date"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={income.date}
            onChange={(e) => handleInputChange(e, 'date')}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Income'}
        </button>
      </form>
    </div>
  );
};