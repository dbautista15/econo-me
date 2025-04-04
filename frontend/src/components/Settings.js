// frontend/src/components/Settings.js

import React, { useState } from 'react';
import ProfileSettings from './ProfileSettings';
import FinancialSettings from './FinancialSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'financial'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Financial
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'profile' ? (
            <ProfileSettings />
          ) : (
            <FinancialSettings />
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;