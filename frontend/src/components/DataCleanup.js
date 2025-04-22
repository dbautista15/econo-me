import React, { useState, useEffect } from 'react';
import { fetchExpenses } from '../utils/api';

const DataCleanup = ({ onSuccess, onError }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  // Function to manually fetch expenses with robust error handling
  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try using the direct fetch approach if the API module is having issues
      const response = await fetch('http://localhost:5003/api/expenses');
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Loaded expenses:", data);
      setExpenses(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('Failed to load expenses:', error);
      setError(`Failed to load expenses: ${error.message}`);
      if (onError) onError(`Failed to load expenses: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSelectAll = () => {
    if (selectedItems.length === expenses.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(expenses.map(expense => expense.id));
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      setLoading(true);
      
      // Delete one by one for now to avoid needing a bulk endpoint
      for (const id of selectedItems) {
        try {
          const response = await fetch(`http://localhost:5003/api/expenses/${id}`, { 
            method: 'DELETE' 
          });
          
          if (!response.ok) {
            console.warn(`Failed to delete expense ${id}: ${response.status}`);
          }
        } catch (itemError) {
          console.warn(`Error deleting expense ${id}:`, itemError);
        }
      }
      
      // Refresh the expenses list
      await loadExpenses();
      setSelectedItems([]);
      
      if (onSuccess) onSuccess(`Attempted to delete ${selectedItems.length} entries`);
    } catch (error) {
      console.error('Failed to delete expenses:', error);
      if (onError) onError('Failed to delete selected expenses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Cleanup Test Data</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
          <div className="mt-2">
            <button
              className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
              onClick={loadExpenses}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {loading ? (
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
                />
                <span className="ml-2">Select All</span>
              </label>
            </div>
            
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              disabled={selectedItems.length === 0 || loading}
              onClick={handleDeleteSelected}
            >
              Delete Selected ({selectedItems.length})
            </button>
          </div>
          
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
                        />
                      </td>
                      <td className="px-4 py-2">{expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-2">{expense.category || 'N/A'}</td>
                      <td className="px-4 py-2 text-right">${parseFloat(expense.amount || 0).toFixed(2)}</td>
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
          onClick={loadExpenses}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
};

export default DataCleanup;