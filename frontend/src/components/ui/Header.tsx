import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
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