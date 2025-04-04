import React, { useState, useEffect, useCallback } from 'react';import { 
  fetchRecurringTransactions, 
  createRecurringTransaction, 
  updateRecurringTransaction, 
  deleteRecurringTransaction,
  processRecurringTransactions
} from '../utils/api';

const RecurringTransactions = ({ categories, onSuccessMessage, onErrorMessage }) => {
  const [loading, setLoading] = useState(true);
  const [processingTransactions, setProcessingTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Food',
    amount: '',
    description: '',
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_expense: true
  });

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchRecurringTransactions();
      setTransactions(data);
    } catch (error) {
      onErrorMessage(`Failed to load recurring transactions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [onErrorMessage]); 
    useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Food',
      amount: '',
      description: '',
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      is_expense: true
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Convert amount to number and format data
      const dataToSubmit = {
        ...formData,
        amount: parseFloat(formData.amount),
        end_date: formData.end_date || null
      };
      
      if (isEditing) {
        await updateRecurringTransaction(currentId, dataToSubmit);
        onSuccessMessage('Recurring transaction updated successfully');
      } else {
        await createRecurringTransaction(dataToSubmit);
        onSuccessMessage('Recurring transaction created successfully');
      }
      
      // Reload the transactions and reset form
      await loadTransactions();
      resetForm();
      setShowForm(false);
    } catch (error) {
      onErrorMessage(`Failed to ${isEditing ? 'update' : 'create'} recurring transaction: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      title: transaction.title,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description || '',
      frequency: transaction.frequency,
      start_date: new Date(transaction.start_date).toISOString().split('T')[0],
      end_date: transaction.end_date ? new Date(transaction.end_date).toISOString().split('T')[0] : '',
      is_expense: transaction.is_expense
    });
    setIsEditing(true);
    setCurrentId(transaction.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recurring transaction?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteRecurringTransaction(id);
      onSuccessMessage('Recurring transaction deleted successfully');
      await loadTransactions();
    } catch (error) {
      onErrorMessage(`Failed to delete recurring transaction: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleProcessTransactions = async () => {
    try {
      setProcessingTransactions(true);
      const result = await processRecurringTransactions();
      onSuccessMessage(`Successfully processed ${result.processed.length} transactions`);
      await loadTransactions(); // Reload to get updated next_due_date values
    } catch (error) {
      onErrorMessage(`Failed to process transactions: ${error.message}`);
    } finally {
      setProcessingTransactions(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Header and Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recurring Transactions</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
          >
            {showForm ? 'Cancel' : 'Add New'}
          </button>
          <button
            onClick={handleProcessTransactions}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
            disabled={processingTransactions}
          >
            {processingTransactions ? 'Processing...' : 'Process Due Transactions'}
          </button>
        </div>
      </div>
      
      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="title">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="amount">
                  Amount ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  step="0.01"
                  min="0.01"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="frequency">
                  Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.frequency}
                  onChange={handleChange}
                >
                  {frequencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="start_date">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="end_date">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.end_date}
                  onChange={handleChange}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="description">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
              
              <div className="mb-4 flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_expense"
                    className="mr-2 h-4 w-4"
                    checked={formData.is_expense}
                    onChange={handleChange}
                  />
                  <span className="text-gray-700">This is an expense (uncheck for income)</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Transactions List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {loading && !transactions.length ? (
          <div className="flex justify-center items-center h-32">
            <div className="spinner"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Frequency</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-center">Next Due</th>
                  <th className="px-4 py-2 text-center">Type</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id} className="border-t">
                    <td className="px-4 py-3">{transaction.title}</td>
                    <td className="px-4 py-3">{transaction.category}</td>
                    <td className="px-4 py-3">
                      {frequencyOptions.find(f => f.value === transaction.frequency)?.label || transaction.frequency}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${parseFloat(transaction.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {formatDate(transaction.next_due_date)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.is_expense ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {transaction.is_expense ? 'Expense' : 'Income'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.is_active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center">No recurring transactions found. Add your first one!</p>
        )}
      </div>
    </div>
  );
};

export default RecurringTransactions;