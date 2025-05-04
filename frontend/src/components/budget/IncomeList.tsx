import React, { useState } from 'react';
import { useIncomeManagement } from '../../hooks';
import { IncomeEntryForm } from './IncomeEntryForm';
import { Income } from '../../../../types';

interface IncomeListProps {
  incomes: Income[];
  onUpdate: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const IncomeList: React.FC<IncomeListProps> = ({
  incomes,
  onUpdate,
  onSuccess,
  onError
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ amount: string, date: string }>({ amount: '', date: '' });
  
  const { updateIncome, deleteIncome, loading } = useIncomeManagement({
    onSuccess,
    onError,
    onUpdate
  });
  
  const handleEdit = (income: Income) => {
    setEditingId(income.id);
    setEditData({
      amount: income.amount.toString(),
      date: new Date(income.income_date).toISOString().split('T')[0]
    });
  };
  
  const handleUpdate = async () => {
    if (!editingId) return;
    
    const success = await updateIncome(editingId, editData.amount, editData.date);
    if (success) {
      setEditingId(null);
      onUpdate();
    }
  };
  
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      const success = await deleteIncome(id);
      if (success) onUpdate();
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Income Entries</h2>
      
      {incomes.length === 0 ? (
        <p className="text-gray-500">No income entries yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incomes.map(income => (
                <tr key={income.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === income.id ? (
                      <input
                        type="date"
                        value={editData.date}
                        onChange={e => setEditData({...editData, date: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      new Date(income.income_date).toLocaleDateString()
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === income.id ? (
                      <input
                        type="number"
                        value={editData.amount}
                        onChange={e => setEditData({...editData, amount: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                        step="0.01"
                      />
                    ) : (
                      `$${parseFloat(income.amount.toString()).toFixed(2)}`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === income.id ? (
                      <>
                        <button
                          onClick={handleUpdate}
                          disabled={loading}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(income)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(income.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};