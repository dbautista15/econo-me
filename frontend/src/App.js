import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Registration';
import ProtectedRoute from './components/ProtectedRoute';
import { Header, Navigation, Footer, NotificationMessage } from './components/Layout';
import Dashboard from './components/Dashboard';
import ExpenseTracker from './components/ExpenseTracker';
import IncomeGoals from './components/IncomeGoals';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Show notification messages
  const showMessage = (message, type) => {
    if (type === 'success') {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="container mx-auto px-4 py-8 flex-grow">
          {successMessage && (
            <NotificationMessage message={successMessage} type="success" />
          )}
          
          {errorMessage && (
            <NotificationMessage message={errorMessage} type="error" />
          )}
          
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard 
                    setActiveTab={() => setActiveTab('dashboard')}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/expenses" 
              element={
                <ProtectedRoute>
                  <ExpenseTracker 
                    onSuccessMessage={(msg) => showMessage(msg, 'success')}
                    onErrorMessage={(msg) => showMessage(msg, 'error')}
                    setActiveTab={() => setActiveTab('expenses')}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/goals" 
              element={
                <ProtectedRoute>
                  <IncomeGoals 
                    onSuccessMessage={(msg) => showMessage(msg, 'success')}
                    onErrorMessage={(msg) => showMessage(msg, 'error')}
                    setActiveTab={() => setActiveTab('goals')}
                  />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;