// frontend/src/components/ProfileSettings.js

import React, { useState, useEffect } from 'react';
import { fetchUserProfile, updateUserProfile } from '../utils/api';

const ProfileSettings = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    currency: 'USD',
    date_format: 'MM/DD/YYYY',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchUserProfile();
        setProfile(response.user);
        setFormData({
          first_name: response.user.first_name || '',
          last_name: response.user.last_name || '',
          currency: response.user.currency || 'USD',
          date_format: response.user.date_format || 'MM/DD/YYYY',
        });
      } catch (error) {
        setErrorMessage('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await updateUserProfile(formData);
      setProfile(response.user);
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to update profile');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile.id) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
      
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
          <label className="block text-gray-700 mb-2" htmlFor="username">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            value={profile.username || ''}
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            value={profile.email || ''}
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="first_name">
            First Name
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.first_name}
            onChange={handleChange}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="last_name">
            Last Name
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.currency}
            onChange={handleChange}
          >
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
            <option value="JPY">Japanese Yen (¥)</option>
            <option value="CAD">Canadian Dollar (C$)</option>
            <option value="AUD">Australian Dollar (A$)</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="date_format">Date Format
          </label>
          <select
            id="date_format"
            name="date_format"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.date_format}
            onChange={handleChange}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;