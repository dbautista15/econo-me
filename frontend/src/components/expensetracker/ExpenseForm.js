import React from 'react';

const ExpenseForm = ({
  category, amount, expenseDate, onCategoryChange,
  onAmountChange, onDateChange, onSubmit, formErrors,
  categories, loading, submitLoading
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
    <form onSubmit={onSubmit}>
      <div className="mb-4">
        <label htmlFor="expenseDate" className="block mb-2 text-gray-700">Date</label>
        <input
          id="expenseDate"
          type="date"
          className="w-full p-2 border rounded-md"
          value={expenseDate}
          onChange={(e) => onDateChange(e.target.value)}
          required
        />
        {formErrors.date && <p className="text-sm text-red-600">{formErrors.date}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="category" className="block mb-2 text-gray-700">Category</label>
        <select
          id="category"
          className="w-full p-2 border rounded-md"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={loading}
        >
          {loading
            ? <option>Loading categories...</option>
            : categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="amount" className="block mb-2 text-gray-700">Amount ($)</label>
        <input
          id="amount"
          type="number"

          className="w-full p-2 border rounded-md"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          required
        />
        {formErrors.amount && <p className="text-sm text-red-600">{formErrors.amount}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        disabled={submitLoading}
      >
        {submitLoading ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  </div>
);

export default ExpenseForm;