import React from 'react';
import { Expense, RecentExpensesTableProps } from '../../../../types';
import { transformations } from '../../utils/transformations';

const RecentExpensesTable: React.FC<RecentExpensesTableProps> = ({ expenses }) => {
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

  // Calculate total expenses
  const calculateTotal = (): number => {
    return expenses.reduce((sum, expense) => {
      // Ensure amount is treated as a number
      const amount = typeof expense.amount === 'string' 
        ? parseFloat(expense.amount) 
        : expense.amount;
      
      return sum + amount;
    }, 0);
  };

  return (
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
                <tr key={expense.id || index}>
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
  );
};

export default RecentExpensesTable;