// Fixed Navigation component with proper TabType
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NavigationProps, TabType } from '../../../../types';

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  // Fix: Change the parameter type from string to TabType
  const handleTabClick = (tab: TabType, path: string): void => {
    setActiveTab(tab);
    navigate(path);
  };

  return (
    <div className="bg-white shadow">
      <div className="container mx-auto px-4">
        <nav className="flex">
          <button
            className={`px-4 py-4 font-medium ${
              activeTab === 'dashboard' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500'
            }`}
            onClick={() => handleTabClick('dashboard', '/dashboard')}
          >
            Dashboard
          </button>
          
          {/* You can add more tabs here as needed */}
          <button
            className={`px-4 py-4 font-medium ${
              activeTab === 'settings' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500'
            }`}
            onClick={() => handleTabClick('settings', '/settings')}
          >
            Settings
          </button>
        </nav>
      </div>
    </div>
  );
};