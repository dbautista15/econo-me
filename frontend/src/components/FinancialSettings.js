// frontend/src/components/FinancialSettings.js

import React, { useState, useEffect } from 'react';
import { fetchUserSettings, updateUserSettings } from '../utils/api';

const FinancialSettings = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [formData, setFormData] = useState({
    monthly_income: 0,
    spending_limit: 0,
    savings_goal: 0,
    notification_enabled: false,
    theme: 'light'
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchUserSettings();
        setSettings(data);
        setFormData({
          monthly_income: data.monthly_income || 0,
          spending_limit: data.spending_limit || 0,
          savings_goal: data.savings_goal || 0,
          notification_enabled: data.notification_enabled || false,
          theme: data.theme || 'light'
        });
      } catch (error) {
        setErrorMessage('Failed to load settings data');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Convert numeric fields to numbers
    const dataToSubmit = {
      ...formData,
      monthly_income: parseFloat(formData.monthly_income),
      spending_limit: parseFloat(formData.spending_limit),
      savings_goal: parseFloat(formData.savings_goal)
    };
    
    try {
      const response = await updateUserSettings(dataToSubmit);
      setSettings(response.settings);
      setSuccessMessage('Settings updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to update settings');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings.id) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Financial Settings</h2>
      
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="monthly_income">
            Monthly Income ($)
          </label>
          <input
            type="number"
            id="monthly_income"
            name="monthly_income"
            step="0.01"
            min="0"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.monthly_income}
            onChange={handleChange}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="spending_limit">
            Monthly Spending Limit ($)
          </label>
          <input
            type="number"
            id="spending_limit"
            name="spending_limit"
            step="0.01"
            min="0"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.spending_limit}
            onChange={handleChange}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="savings_goal">
            Monthly Savings Goal ($)
          </label>
          <input
            type="number"
            id="savings_goal"
            name="savings_goal"
            step="0.01"
            min="0"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.savings_goal}
            onChange={handleChange}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="theme">
            Theme
          </label>
          <select
            id="theme"
            name="theme"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.theme}
            onChange={handleChange}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="notification_enabled"
              className="mr-2 h-4 w-4"
              checked={formData.notification_enabled}
              onChange={handleChange}
            />
            <span className="text-gray-700">Enable notifications</span>
          </label>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Settings'}
        </button>
      </form>
    </div>
  );
};

export default FinancialSettings;