import React from 'react';

const FilterExpenses = ({ filter, setFilter, categories, filteredExpenses }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Filter Expenses</h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="filterCategory">
          Category
        </label>
        <select
          id="filterCategory"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="startDate">
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={filter.startDate}
            onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2" htmlFor="endDate">
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={filter.endDate}
            onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="overflow-auto max-h-64">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">
                    {new Date(expense.expense_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{expense.category}</td>
                  <td className="px-4 py-2 text-right">${parseFloat(expense.amount).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-4 py-2 text-center text-gray-500">
                  No expenses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FilterExpenses;