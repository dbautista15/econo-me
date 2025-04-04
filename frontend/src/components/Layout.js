import React from 'react';

export const Header = () => (
  <header className="bg-blue-600 text-white shadow-lg">
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold">Econo-me</h1>
      <p className="text-blue-100">Your Personal Finance Manager</p>
    </div>
  </header>
);

export const Navigation = ({ activeTab, setActiveTab }) => (
  <div className="bg-white shadow">
    <div className="container mx-auto px-4">
      <nav className="flex">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-4 font-medium ${activeTab === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-4 font-medium ${activeTab === 'expenses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Track Expenses
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-4 font-medium ${activeTab === 'goals' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Income & Goals
        </button>
      </nav>
    </div>
  </div>
);

export const NotificationMessage = ({ message, type }) => (
  <div className={`mb-4 p-4 ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded-md`}>
    {message}
  </div>
);

export const Footer = () => (
  <footer className="bg-gray-800 text-white mt-12">
    <div className="container mx-auto px-4 py-6">
      <p className="text-center text-gray-400">© 2025 Econo-me. All rights reserved.</p>
    </div>
  </footer>
);