import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NavigationProps } from '../../../../types';

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const handleTabClick = (tab: 'dashboard' | 'settings', path: string): void => {
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