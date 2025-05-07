import React, { useState, useEffect, useCallback, FormEvent, ChangeEvent } from 'react';
import api from '../../utils/api';
import { 
  Expense, 
  ExpenseForm,
  FormErrors,
  DeletionResults 
} from '../../../../types';

export interface ExpenseManagerProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  refreshData?: () => void;
}


// Type definition for loading state
type LoadingState = {
  fetch: boolean;
  delete: boolean;
  add: boolean;
  update: boolean;
};

// Define tab types for better readability
type TabType = 'add' | 'manage'; // The 'manage' tab will handle both update and delete operations

const ExpenseManager: React.FC<ExpenseManagerProps> = ({ onSuccess, onError }) => {
  // --- State management ---
  const [activeTab, setActiveTab] = useState<TabType>('add');
  
  // Expense form state
  const [expense, setExpense] = useState<ExpenseForm>({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description:''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // Expenses list state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [deletionResults, setDeletionResults] = useState<DeletionResults>({
    success: 0,
    failed: 0,
    total:0
  });

  // Edit state
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  // Loading and error states
  const [loading, setLoading] = useState<LoadingState>({
    fetch: false,
    delete: false,
    add: false,
    update: false
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- API calls ---
  
  // Fetch categories
  const fetchCategories = useCallback(async (): Promise<void> => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      
      const categoriesData = await api.get<string[]>('/categories');
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      
      // Update expense form with first category if none selected
      if (!expense.category && Array.isArray(categoriesData) && categoriesData.length > 0) {
        setExpense(prev => ({ ...prev, category: categoriesData[0] }));
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      const errorMessage = 'Failed to load categories';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [expense.category, onError]);

  // Fetch expenses
  const fetchExpenses = useCallback(async (): Promise<void> => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      setError(null);

      const response = await api.get<Expense[]>('/expenses');
      
      if (Array.isArray(response)) {
        setExpenses(response);
      } else if (response && typeof response === 'object' && 'data' in response) {
        setExpenses(Array.isArray((response as any).data) ? (response as any).data : []);
      } else {
        setExpenses([]);
        throw new Error('Unexpected API response format');
      }
    } catch (err: any) {
      const errorMessage = `Failed to load expenses: ${err.message}`;
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [onError]);

  // Initial data load
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      await Promise.all([fetchCategories(), fetchExpenses()]);
    };
    loadData();
  }, [fetchCategories, fetchExpenses]);

  // --- Form handlers ---
  
  // Handler for updating form fields
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof ExpenseForm
  ): void => {
    setExpense({
      ...expense,
      [field]: e.target.value
    });
  };
  
  // Setup edit mode for an expense
  const handleEdit = (expenseToEdit: Expense): void => {
    setEditingExpense(expenseToEdit);
    setActiveTab('add'); // Switch to add tab which will be in edit mode
    
    // Format the date string properly for the input field
    let dateValue = '';
    if (expenseToEdit.expense_date) {
      const date = new Date(expenseToEdit.expense_date);
      dateValue = date.toISOString().split('T')[0];
    }
    
    // Fill the form with expense data
    setExpense({
      category: expenseToEdit.category || '',
      amount: expenseToEdit.amount.toString(),
      date: dateValue,
      description:''
    });
  };
  
  // Cancel edit mode
  const handleCancelEdit = (): void => {
    setEditingExpense(null);
    // Reset form
    setExpense({
      category: categories[0] || '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description:''
    });
  };
  
  // Handle add/update expense form submission
  const handleSubmitExpense = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    
    // Set appropriate loading state
    setLoading(prev => ({ 
      ...prev, 
      add: !editingExpense,
      update: !!editingExpense
    }));
    
    try {
      // Convert amount to number safely
      const amountValue = typeof expense.amount === 'string' 
        ? expense.amount 
        : expense.amount.toString();
      const parsedAmount = parseFloat(amountValue);
      
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      
      const expenseData = {
        category: expense.category,
        amount: parsedAmount,
        expense_date: new Date(expense.date).toISOString()
      };
      
      let message: string;
      
      if (editingExpense) {
        // Update existing expense
        await api.put(`/expenses/${editingExpense.id}`, expenseData);
        message = 'Expense updated successfully!';
      } else {
        // Add new expense
        await api.post('/expenses', expenseData);
        message = 'Expense added successfully!';
      }
      
      // Show success message
      setSuccessMessage(message);
      if (onSuccess) onSuccess(message);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Reset form and edit mode
      setExpense({
        category: categories[0] || '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description:''
      });
      setEditingExpense(null);
      
      // Refresh expense list
      fetchExpenses();
    } catch (err) {
      console.error('Error saving expense:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save expense';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        add: false,
        update: false
      }));
    }
  };

  // --- Delete expense handlers ---
  
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
      setDeletionResults({ success: 0, failed: 0,total:0 });
      setError(null);

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
      await fetchExpenses();
      setSelectedItems([]);
      
      const message = `Successfully deleted ${successCount} of ${totalToDelete} entries`;
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      if (onSuccess) onSuccess(message);
      
      if (failedCount > 0) {
        const warningMessage = `Failed to delete ${failedCount} entries`;
        if (onError) onError(warningMessage);
      }
    } catch (error) {
      const errorMessage = 'Failed to complete delete operation';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setDeletionResults({ success: successCount, failed: failedCount,total:failedCount });
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // --- Helper functions ---
  
  // Format date helper
  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Format amount helper
  const formatAmount = (amount: number | string): string => {
    if (amount === undefined || amount === null) return '$0.00';
    return `$${parseFloat(amount as string).toFixed(2)}`;
  };

  const isLoading = loading.fetch || loading.delete || loading.add || loading.update;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'add' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => {
            setActiveTab('add');
            if (editingExpense === null) {
              // Reset form when switching to add tab without editing
              setExpense({
                category: categories[0] || '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                description:''
              });
            }
          }}
        >
          {editingExpense ? 'Edit Expense' : 'Add Expense'}
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'manage' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Expenses
        </button>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {successMessage}
        </div>
      )}

      {/* Add/Edit Expense Form */}
      {activeTab === 'add' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <form onSubmit={handleSubmitExpense}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={expense.category}
                onChange={(e) => handleInputChange(e, 'category')}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
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
                min="0.01"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={expense.amount}
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
                value={expense.date}
                onChange={(e) => handleInputChange(e, 'date')}
                required
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className={`flex-1 bg-${editingExpense ? 'green' : 'blue'}-600 hover:bg-${editingExpense ? 'green' : 'blue'}-700 text-white font-medium py-2 px-4 rounded-md`}
                disabled={loading.add || loading.update}
              >
                {loading.add || loading.update 
                  ? (editingExpense ? 'Updating...' : 'Adding...') 
                  : (editingExpense ? 'Update Expense' : 'Add Expense')}
              </button>
              
              {editingExpense && (
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Manage Expenses */}
      {activeTab === 'manage' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Manage Expenses</h2>

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
                        <th className="px-4 py-2 text-center">Actions</th>
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
                          <td className="px-4 py-2 text-center">
                            <button
                              className="text-blue-600 hover:text-blue-800 mr-2"
                              onClick={() => handleEdit(expense)}
                              disabled={isLoading}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => {
                                setSelectedItems([expense.id]);
                                handleDeleteSelected();
                              }}
                              disabled={isLoading}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : !error ? (
                <p className="text-center text-gray-500 my-4">No expenses found.</p>
              ) : null}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => fetchExpenses()}
                  disabled={isLoading}
                >
                  {loading.fetch ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseManager;