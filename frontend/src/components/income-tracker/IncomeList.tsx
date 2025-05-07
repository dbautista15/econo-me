import React, { useState, useCallback, useEffect } from 'react';
import api from '../../utils/api';  // Use the same API utility as DeleteExpenses
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
  const [editData, setEditData] = useState<{ amount: string, date: string, source: string }>({ 
    amount: '', 
    date: '',
    source: ''
  });
  const [loading, setLoading] = useState(false);
  
  const handleEdit = (income: Income) => {
    setEditingId(income.id);
    setEditData({
      source: income.source || 'Income',
      amount: income.amount.toString(),
      date: new Date(income.income_date).toISOString().split('T')[0]
    });
  };
  
  const handleUpdate = async () => {
    if (!editingId) return;
    
    setLoading(true);
    try {
      await api.put(`/incomes/${editingId}`, {
        source: editData.source,
        amount: parseFloat(editData.amount),
        income_date: editData.date
      });
      
      setEditingId(null);
      onSuccess('Income updated successfully');
      onUpdate();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating income:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await api.delete(`/incomes/${id}`);
      
      onSuccess('Income deleted successfully');
      onUpdate();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting income:', err);
    } finally {
      setLoading(false);
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
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
                        type="text"
                        value={editData.source}
                        onChange={e => setEditData({...editData, source: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      income.source || 'Income'
                    )}
                  </td>
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
                          disabled={loading}
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