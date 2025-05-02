import React from 'react';
import type { ExpenseFilterProps, ExpenseFilter as ExpenseFilterType } from '../../../../types';


const ExpenseFilter: React.FC<ExpenseFilterProps> = ({ filter, setFilter, categories }) => {
  // Handler for updating a single filter property
  const handleFilterChange = (key: keyof ExpenseFilterType, value: string): void => {
    setFilter({ ...filter, [key]: value });
  };

  // Handler for clearing all filters
  const handleClearFilters = (): void => {
    setFilter({ startDate: '', endDate: '', category: 'All' });
  };

  return (
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
      <div className="mt-4 flex justify-end">
        <button
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
          onClick={handleClearFilters}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default ExpenseFilter;