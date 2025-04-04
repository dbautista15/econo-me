import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const { currentUser, logout } = useAuth();
  
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Econo-me</h1>
            <p className="text-blue-100">Your Personal Finance Manager</p>
          </div>
          <div>
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span>Welcome, {currentUser.username}</span>
                <button 
                  onClick={logout}
                  className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link 
                  to="/login"
                  className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-400 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export const Navigation = ({ activeTab, setActiveTab }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null;
  
  return (
    <div className="bg-white shadow">
      <div className="container mx-auto px-4">
        <nav className="flex">
          <Link
            to="/dashboard"
            className={`px-4 py-4 font-medium ${activeTab === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </Link>
          <Link
            to="/expenses"
            className={`px-4 py-4 font-medium ${activeTab === 'expenses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('expenses')}
          >
            Track Expenses
          </Link>
          <Link
            to="/goals"
            className={`px-4 py-4 font-medium ${activeTab === 'goals' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('goals')}
          >
            Income & Goals
          </Link>
        </nav>
      </div>
    </div>
  );
};

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