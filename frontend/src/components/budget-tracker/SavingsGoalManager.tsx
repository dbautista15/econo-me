import React, { useState, useCallback, useEffect } from 'react';
import api from '../../utils/api';
import { SavingsGoal } from '../../../../types';
import { transformations } from '../../utils/transformations';
import { LoadingSpinner } from '../layout/ui/LoadingSpinner';
import { SavingsGoalFormData } from '../../../../types';
import {useFormState} from '../../utils/useFormState';


export interface SavingsGoalManagerProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  refreshData?: () => void;
}
const SavingsGoalManager: React.FC = () => {
  // State
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize form
  const { values, handleChange, resetForm, setValues } = useFormState<SavingsGoalFormData>({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: '',
    priority:''
  });

  // Fetch savings goals
  const fetchSavingsGoals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<SavingsGoal[]>('/savings-goals');
      setSavingsGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load savings goals');
      console.error('Error fetching savings goals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load goals on component mount
  useEffect(() => {
    fetchSavingsGoals();
  }, [fetchSavingsGoals]);

  // Show success message temporarily
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle deleting a goal
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      setLoading(true);
      try {
        await api.delete(`/savings-goals/${id}`);
        showSuccess('Savings goal deleted successfully');
        fetchSavingsGoals();
      } catch (err) {
        setError('Failed to delete savings goal');
        console.error('Error deleting savings goal:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle form submission for add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!values.name || !values.targetAmount) {
      setError('Name and target amount are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const goalData = {
        name: values.name,
        target_amount: transformations.parseAmount(values.targetAmount),
        current_amount: transformations.parseAmount(values.currentAmount),
        target_date: values.targetDate || null
      };
      
      if (editingGoal) {
        // Update existing goal
        await api.put(`/savings-goals/${editingGoal.id}`, goalData);
        showSuccess('Savings goal updated successfully');
      } else {
        // Add new goal
        await api.post('/savings-goals', goalData);
        showSuccess('Savings goal created successfully');
      }
      
      resetForm();
      setShowAddForm(false);
      setEditingGoal(null);
      fetchSavingsGoals();
    } catch (err) {
      setError(`Failed to ${editingGoal ? 'update' : 'create'} savings goal`);
      console.error(`Error ${editingGoal ? 'updating' : 'creating'} savings goal:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Set up form for editing
  const handleEdit = (goal: SavingsGoal) => {
    setValues({
      name: goal.name,
      targetAmount: goal.target_amount.toString(),
      currentAmount: goal.current_amount.toString(),
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
      priority:''
    });

    setEditingGoal(goal);
    setShowAddForm(false);
  };

  // Handle deposit/withdraw
  const handleAdjustAmount = async (isDeposit: boolean = true) => {
    if (!depositGoal || !depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const amount = transformations.parseAmount(depositAmount);
      
      // Calculate the new amount
      const newAmount = isDeposit 
        ? depositGoal.current_amount + amount
        : Math.max(0, depositGoal.current_amount - amount);
      
      // Update the goal with the new amount
      await api.put(`/savings-goals/${depositGoal.id}`, {
        name: depositGoal.name,
        target_amount: depositGoal.target_amount,
        current_amount: newAmount,
        target_date: depositGoal.targetDate
      });
      
      showSuccess(`Amount ${isDeposit ? 'deposited to' : 'withdrawn from'} savings goal successfully`);
      setDepositGoal(null);
      setDepositAmount('');
      fetchSavingsGoals();
    } catch (err) {
      setError(`Failed to ${isDeposit ? 'deposit to' : 'withdraw from'} savings goal`);
      console.error(`Error adjusting savings goal:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress for a goal
  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    const percentage = (current / target) * 100;
    return Math.min(Math.max(0, percentage), 100);
  };

  if (loading && savingsGoals.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Savings Goals</h2>

        {!showAddForm && !editingGoal && !depositGoal && (
          <button
            onClick={() => {
              setShowAddForm(true);
              resetForm();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Add New Goal
          </button>
        )}
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

      {/* Add/Edit Form */}
      {(showAddForm || editingGoal) && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">
            {editingGoal ? 'Edit Savings Goal' : 'Add New Savings Goal'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Goal Name</label>
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Target Amount ($)</label>
              <input
                type="number"
                name="targetAmount"
                value={values.targetAmount}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Current Amount ($)</label>
              <input
                type="number"
                name="currentAmount"
                value={values.currentAmount}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Target Date (Optional)</label>
              <input
                type="date"
                name="targetDate"
                value={values.targetDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                disabled={loading}
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingGoal(null);
                  resetForm();
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deposit/Withdraw Form */}
      {depositGoal && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">
            Adjust Amount for {depositGoal.name}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => handleAdjustAmount(true)}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                disabled={loading}
              >
                Deposit
              </button>

              <button
                onClick={() => handleAdjustAmount(false)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded"
                disabled={loading}
              >
                Withdraw
              </button>

              <button
                onClick={() => {
                  setDepositGoal(null);
                  setDepositAmount('');
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Savings Goals List */}
      {savingsGoals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>You don't have any savings goals yet.</p>
          <p>Create your first goal to start tracking your progress!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {savingsGoals.map(goal => (
            <div key={goal.id} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">{goal.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setDepositGoal(goal)}
                    className="text-green-600 hover:text-green-900 text-sm"
                    disabled={loading}
                  >
                    Adjust
                  </button>
                  <button
                    onClick={() => handleEdit(goal)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-sm text-gray-600">Target Amount</p>
                  <p className="font-medium">${transformations.formatCurrency(goal.target_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Amount</p>
                  <p className="font-medium">${transformations.formatCurrency(goal.current_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Target Date</p>
                  <p className="font-medium">
                    {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No target date'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Remaining</p>
                  <p className="font-medium">
                    ${transformations.formatCurrency(Math.max(0, goal.target_amount - goal.current_amount))}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${calculateProgress(goal.current_amount, goal.target_amount)}%` }}
                ></div>
              </div>
              <p className="text-xs text-right text-gray-500">
                {Math.round(calculateProgress(goal.current_amount, goal.target_amount))}% Complete
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavingsGoalManager;