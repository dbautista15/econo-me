import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import api from '../../utils/api';
import { Income } from '../../../../types';

interface IncomeForm {
  id?: number;
  source: string;
  amount: string;
  date: string;
}

interface IncomeManagerProps {
  onSuccessMessage?: (message: string) => void;
  onErrorMessage?: (message: string) => void;
}

export const IncomeManager: React.FC<IncomeManagerProps> = ({
  onSuccessMessage,
  onErrorMessage
}) => {
  // State for income entries and form
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [currentIncome, setCurrentIncome] = useState<IncomeForm>({
    source: 'Salary',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  // Loading and error states
  const [loading, setLoading] = useState({
    fetch: false,
    add: false,
    update: false,
    delete: false
  });
  const [error, setError] = useState('');

  // Fetch incomes
  const fetchIncomes = async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const response = await api.get<Income[]>('/incomes');
      setIncomes(Array.isArray(response) ? response : []);
      
      if (onSuccessMessage) {
        onSuccessMessage('Incomes loaded successfully');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load incomes';
      setError(errorMsg);
      if (onErrorMessage) onErrorMessage(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  // Initial data load
  useEffect(() => {
    fetchIncomes();
  }, []);

  // Handler for input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof IncomeForm
  ) => {
    setCurrentIncome(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Handle form submission (Add/Update)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    try {
      const incomeData = {
        source: currentIncome.source,
        amount: parseFloat(currentIncome.amount),
        income_date: new Date(currentIncome.date).toISOString()
      };

      setLoading(prev => ({ ...prev, add: true, update: true }));

      if (editingIncome) {
        // Update existing income
        await api.put(`/incomes/${editingIncome.id}`, incomeData);
        
        if (onSuccessMessage) {
          onSuccessMessage('Income updated successfully');
        }
      } else {
        // Add new income
        await api.post('/incomes', incomeData);
        
        if (onSuccessMessage) {
          onSuccessMessage('Income added successfully');
        }
      }

      // Reset form and refresh list
      setCurrentIncome({
        source: 'Salary',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
      setEditingIncome(null);
      await fetchIncomes();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save income';
      setError(errorMsg);
      if (onErrorMessage) onErrorMessage(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, add: false, update: false }));
    }
  };

  // Handle editing an income
  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setCurrentIncome({
      id: income.id,
      source: income.source,
      amount: income.amount.toString(),
      date: new Date(income.income_date).toISOString().split('T')[0]
    });
  };

  // Handle deleting an income
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this income entry?')) return;

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      await api.delete(`/incomes/${id}`);
      
      if (onSuccessMessage) {
        onSuccessMessage('Income deleted successfully');
      }
      
      await fetchIncomes();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete income';
      setError(errorMsg);
      if (onErrorMessage) onErrorMessage(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingIncome(null);
    setCurrentIncome({
      source: 'Salary',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Form Section */}
      <form onSubmit={handleSubmit} className="mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingIncome ? 'Edit Income' : 'Add New Income'}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="source">
            Source
          </label>
          <input
            id="source"
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={currentIncome.source}
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
            value={currentIncome.amount}
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
            value={currentIncome.date}
            onChange={(e) => handleInputChange(e, 'date')}
            required
          />
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            className={`flex-1 ${editingIncome ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 px-4 rounded-md`}
            disabled={loading.add || loading.update}
          >
            {loading.add || loading.update 
              ? (editingIncome ? 'Updating...' : 'Adding...') 
              : (editingIncome ? 'Update Income' : 'Add Income')}
          </button>
          
          {editingIncome && (
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Income List Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Income Entries</h2>
        {loading.fetch ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : incomes.length === 0 ? (
          <p className="text-center text-gray-500">No income entries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Source</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income) => (
                  <tr key={income.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{income.source}</td>
                    <td className="px-4 py-2">
                      {new Date(income.income_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ${income.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className="text-blue-600 hover:text-blue-800 mr-2"
                        onClick={() => handleEdit(income)}
                        disabled={loading.update || loading.delete}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(income.id)}
                        disabled={loading.update || loading.delete}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeManager;