import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavigationProps {
  activeTab: 'UnifiedDashboard' | 'settings';
  setActiveTab: (tab: 'UnifiedDashboard' | 'settings') => void;
  isAuthenticated: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  setActiveTab,
  isAuthenticated
}) => {
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const handleTabClick = (tab: 'UnifiedDashboard' | 'settings', path: string): void => {
    setActiveTab(tab);
    navigate(path);
  };

  return (
    <div className="bg-white shadow">
      <div className="container mx-auto px-4">
        <nav className="flex">
          <button
            className={`px-4 py-4 font-medium ${
              activeTab === 'UnifiedDashboard' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500'
            }`}
            onClick={() => handleTabClick('UnifiedDashboard', '/UnifiedDashboard')}
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