/**
 * DeleteExpenses Component
 * 
 * A utility component that allows users to view, select, and delete expense records.
 * It provides batch selection and deletion functionality with visual feedback.
 */
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { DeletionResults, LoadingState, DeleteExpensesProps, Expense } from '../../../../types';
import { ApiSuccess } from '../../../../types'; // Import ApiSuccess type from responses.ts

// Define interface for API response
interface ExpenseResponse extends ApiSuccess<Expense[]> {
  data: Expense[];
  message: string;
}

const DeleteExpenses: React.FC<DeleteExpensesProps> = ({ onSuccess, onError }) => {
  // State with proper TypeScript typing
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    fetch: false,
    delete: false
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [deletionResults, setDeletionResults] = useState<DeletionResults>({
    success: 0,
    failed: 0
  });

  // Memoize the loadExpenses function to avoid recreating it on each render
  const loadExpenses = useCallback(async (): Promise<void> => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      setError(null);

      // Properly type the API response
      const response = await api.get<Expense[]>('/expenses');
      
      // Handle response based on its structure
      if (Array.isArray(response)) {
        // If the response is directly an array of expenses
        setExpenses(response);
      } else if (response && typeof response === 'object' && 'data' in response) {
        // If the response has a data property (ApiSuccess structure)
        const typedResponse = response as ExpenseResponse;
        setExpenses(Array.isArray(typedResponse.data) ? typedResponse.data : []);
      } else {
        // Fallback for unexpected response format
        setExpenses([]);
        throw new Error('Unexpected API response format');
      }
    } catch (error: any) {
      const errorMessage = `Failed to load expenses: ${error.message}`;
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [onError]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleSelectAll = (): void => {
    if (selectedItems.length === expenses.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(expenses.map(expense => expense.id));
    }
  };

  const handleSelectItem = (id: number): void => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleDeleteSelected = async (): Promise<void> => {
    if (selectedItems.length === 0) return;

    const totalToDelete = selectedItems.length;
    let successCount = 0;
    let failedCount = 0;

    try {
      setLoading(prev => ({ ...prev, delete: true }));
      setDeletionResults({ success: 0, failed: 0 });

      // Delete one by one for now to avoid needing a bulk endpoint
      for (const id of selectedItems) {
        try {
          await api.delete(`/expenses/${id}`);
          successCount++;
        } catch (itemError) {
          failedCount++;
        }
      }

      // Refresh the expenses list
      await loadExpenses();
      setSelectedItems([]);
      
      const message = `Successfully deleted ${successCount} of ${totalToDelete} entries`;
      if (onSuccess) onSuccess(message);
      
      if (failedCount > 0) {
        const warningMessage = `Failed to delete ${failedCount} entries`;
        if (onError) onError(warningMessage);
      }
    } catch (error) {
      if (onError) onError('Failed to complete delete operation');
    } finally {
      setDeletionResults({ success: successCount, failed: failedCount });
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Format date helper
  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Format amount helper
  const formatAmount = (amount: number | string ): string => {
    if (amount === undefined || amount === null) return '$0.00';
    return `$${parseFloat(amount as string).toFixed(2)}`;
  };

  const isLoading = loading.fetch || loading.delete;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Cleanup Expenses</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
          <div className="mt-2">
            <button
              className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
              onClick={() => loadExpenses()}
              disabled={isLoading}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {loading.fetch ? (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600"
                  checked={selectedItems.length === expenses.length && expenses.length > 0}
                  onChange={handleSelectAll}
                  disabled={loading.delete}
                />
                <span className="ml-2">Select All</span>
              </label>
            </div>

            <button
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              disabled={selectedItems.length === 0 || isLoading}
              onClick={handleDeleteSelected}
            >
              {loading.delete ? 'Deleting...' : `Delete Selected (${selectedItems.length})`}
            </button>
          </div>

          {deletionResults.success > 0 && (
            <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md text-sm">
              Successfully deleted {deletionResults.success} entries
            </div>
          )}
          
          {deletionResults.failed > 0 && (
            <div className="mb-4 p-2 bg-yellow-100 text-yellow-700 rounded-md text-sm">
              Failed to delete {deletionResults.failed} entries
            </div>
          )}

          {expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left"></th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600"
                          checked={selectedItems.includes(expense.id)}
                          onChange={() => handleSelectItem(expense.id)}
                          disabled={loading.delete}
                        />
                      </td>
                      <td className="px-4 py-2">
                        {formatDate(expense.expense_date)}
                      </td>
                      <td className="px-4 py-2">{expense.category || 'N/A'}</td>
                      <td className="px-4 py-2 text-right">
                        {formatAmount(expense.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !error ? (
            <p className="text-center text-gray-500 my-4">No expenses found.</p>
          ) : null}
        </>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => loadExpenses()}
          disabled={isLoading}
        >
          {loading.fetch ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
};

export default DeleteExpenses;