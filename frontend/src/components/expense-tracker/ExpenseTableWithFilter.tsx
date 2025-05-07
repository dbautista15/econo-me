import React, { useState, useEffect } from 'react';
import { Expense, ExpenseFilterType } from '../../../../types';
import { ExpenseFilterTypeProps } from '../../../../types/components/expense';

export interface ExpenseTableWithFilterProps {
  expenses: Expense[];
  onSuccess?: (message: string) => void;
  categories: string[];
  onFilterChange?: (filteredExpenses: Expense[]) => void;
}

export const ExpenseTableWithFilter: React.FC<ExpenseTableWithFilterProps> = ({ 
  expenses,
  categories,
  onFilterChange
}) => {
  // Filter state
  const [filter, setFilter] = useState<ExpenseFilterTypeProps>({ 
    startDate: '', 
    endDate: '', 
    category: 'All' 
  });

  // Filtered expenses
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>(expenses);

  // Apply filters when expenses or filter changes
  useEffect(() => {
    const filtered = expenses.filter((expense) => {
      const expenseDate = expense.expense_date;
      
      const inDateRange =
        (!filter.startDate || new Date(expenseDate as string) >= new Date(filter.startDate)) &&
        (!filter.endDate || new Date(expenseDate as string) <= new Date(filter.endDate));
        
      const inCategory = filter.category === 'All' || expense.category === filter.category;
      
      return inDateRange && inCategory;
    });
    
    setFilteredExpenses(filtered);
    
    // Notify parent component if callback is provided
    if (onFilterChange) {
      onFilterChange(filtered);
    }
  }, [expenses, filter, onFilterChange]);

  // Handler for updating a single filter property
  const handleFilterChange = (key: keyof ExpenseFilterTypeProps, value: string): void => {
    setFilter({ ...filter, [key]: value });
  };

  // Handler for clearing all filters
  const handleClearFilters = (): void => {
    setFilter({ startDate: '', endDate: '', category: 'All' });
  };

  // Helper function to format currency values
  const formatCurrency = (amount: number | string): string => {
    // Ensure the amount is a number before using toFixed
    if (typeof amount === 'string') {
      return parseFloat(amount).toFixed(2);
    }
    return amount.toFixed(2);
  };

  // Helper function to format dates
  const formatDate = (dateString: string | Date): string => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate total expenses for filtered data
  const calculateTotal = (): number => {
    return filteredExpenses.reduce((sum, expense) => {
      // Ensure amount is treated as a number
      const amount = typeof expense.amount === 'string' 
        ? parseFloat(expense.amount) 
        : expense.amount;
      
      return sum + amount;
    }, 0);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Filter Section */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Filter Expenses</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm text-gray-700 mb-1">From</label>
            <input
              id="startDate"
              type="date"
              className="w-full p-2 border rounded-md"
              value={filter.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm text-gray-700 mb-1">To</label>
            <input
              id="endDate"
              type="date"
              className="w-full p-2 border rounded-md"
              value={filter.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="categoryFilter" className="block text-sm text-gray-700 mb-1">Category</label>
            <select
              id="categoryFilter"
              className="w-full p-2 border rounded-md"
              value={filter.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredExpenses.length} of {expenses.length} expenses shown
          </div>
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Expense List</h2>
        {filteredExpenses.length === 0 ? (
          <p className="text-gray-500">No expenses found matching the current filters.</p>
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
                {filteredExpenses.map((expense, index) => (
                  <tr key={expense.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{formatDate(expense.expense_date)}</td>
                    <td className="px-4 py-2">{expense.category}</td>
                    <td className="px-4 py-2 text-right">
                      ${formatCurrency(expense.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold">
                  <td colSpan={2} className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right">
                    ${formatCurrency(calculateTotal())}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTableWithFilter;