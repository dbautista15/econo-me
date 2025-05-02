import React, { FormEvent, ChangeEvent, useState } from 'react';
import { ExpenseForm, AddExpenseFormProps } from '../../../../types';


const AddExpenseForm: React.FC<AddExpenseFormProps> = ({
  categories,
  onAddExpense
}) => {
  // Internal state management
  const [expense, setExpense] = useState<ExpenseForm>({
    category: categories[0] || '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

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
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    const success = await onAddExpense(expense);
    
    // Reset form on success
    if (success) {
      setExpense({
        category: categories[0] || '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
      <form onSubmit={handleSubmit}>
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

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default AddExpenseForm;