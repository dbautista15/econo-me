
import React, { useState } from 'react';
import { SavingsGoal } from '../../../../types';
import { transformations } from '../../utils/transformations';
import useForm from '../../hooks/useForm';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { SavingsGoalFormData, SavingsGoalManagerProps, SavingsGoalApiData } from '../../../../types/';

/**
 * Component for managing savings savingsGoals
 */
const SavingsGoalManager: React.FC<SavingsGoalManagerProps> = ({
  savingsGoals,
  onSuccessMessage,
  onErrorMessage,
  onUpdate,
  onAddGoal,
  onDeleteGoal,
  onUpdateGoal,
  onAdjustGoalAmount
}) => {
  // State for UI modes
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const { values, handleChange, resetForm, setValues } = useForm<SavingsGoalFormData>({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: ''
  });

  // Handle deleting a goal
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      setIsLoading(true);
      try {
        const success = await onDeleteGoal(id);
        if (success) {
          onSuccessMessage('Savings goal deleted successfully');
          onUpdate();
        }
      } catch (error) {
        onErrorMessage('Failed to delete savings goal');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle form submission for add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!values.name || !values.targetAmount) {
      onErrorMessage('Name and target amount are required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const goalData: SavingsGoalApiData = {
        name: values.name,
        target_amount: transformations.parseAmount(values.targetAmount),
        current_amount: transformations.parseAmount(values.currentAmount),
        target_date: values.targetDate || null
      };
      
      let success = false;
      
      if (editingGoal) {
        // Update existing goal
        success = await onUpdateGoal(editingGoal.id, goalData);
      } else {
        // Add new goal
        success = await onAddGoal(goalData);
      }
      
      if (success) {
        onSuccessMessage(`Savings goal ${editingGoal ? 'updated' : 'created'} successfully`);
        resetForm();
        setShowAddForm(false);
        setEditingGoal(null);
        onUpdate();
      }
    } catch (error) {
      onErrorMessage(`Failed to ${editingGoal ? 'update' : 'create'} savings goal`);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up form for editing
  const handleEdit = (goal: SavingsGoal) => {
    setValues({
      name: goal.name,
      targetAmount: goal.target_amount.toString(),
      currentAmount: goal.current_amount.toString(),
      targetDate: goal.target_date ? new Date(goal.target_date).toISOString().split('T')[0] : ''
    });

    setEditingGoal(goal);
    setShowAddForm(false);
  };

  // Handle deposit/withdraw
  const handleAdjustAmount = async (isDeposit: boolean = true) => {
    if (!depositGoal || !depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      onErrorMessage('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await onAdjustGoalAmount(
        depositGoal.id, 
        transformations.parseAmount(depositAmount), 
        isDeposit
      );
      
      if (success) {
        onSuccessMessage(`Amount ${isDeposit ? 'deposited to' : 'withdrawn from'} savings goal successfully`);
        setDepositGoal(null);
        setDepositAmount('');
        onUpdate();
      }
    } catch (error) {
      onErrorMessage(`Failed to ${isDeposit ? 'deposit to' : 'withdraw from'} savings goal`);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate progress for a goal
  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    const percentage = (current / target) * 100;
    return Math.min(Math.max(0, percentage), 100);
  };

  if (isLoading && savingsGoals.length === 0) {
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
                disabled={isLoading}
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
                disabled={isLoading}
              >
                Deposit
              </button>

              <button
                onClick={() => handleAdjustAmount(false)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded"
                disabled={isLoading}
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
                    disabled={isLoading}
                  >
                    Adjust
                  </button>
                  <button
                    onClick={() => handleEdit(goal)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                    disabled={isLoading}
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
                    {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'No target date'}
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