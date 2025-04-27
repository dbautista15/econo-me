import React from 'react';

const RecentExpensesTable = ({ expenses }) => (
  <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
    <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
    {expenses.length === 0 ? (
      <p className="text-gray-500">No expenses recorded yet.</p>
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
            {expenses.map((expense, index) => (
              <tr key={index}>
                <td>{expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : 'No date'}</td>
                <td>{expense.category}</td>
                <td className="text-right">${parseFloat(expense.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-semibold">
              <td colSpan="2" className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right">
                ${expenses.reduce((sum, exp) => sum + (+exp.amount), 0).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    )}
  </div>
);

export default RecentExpensesTable;