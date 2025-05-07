import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css'

// Components - Layout
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Navigation } from './components/layout/Navigation';

// Auth Components
import AuthPage from './components/auth/AuthPage';
import { storageUtils } from './utils';
import api from './utils/api';
// Dashboard Components
import UnifiedDashboard from './components/dashboard/UnifiedDashboard';

// Notifications
import Notification from './components/layout/ui/Notification';

const App: React.FC = () => {
  // State management without context
  const [activeTab, setActiveTab] = useState<'UnifiedDashboard' | 'settings'>('UnifiedDashboard');

  // Authentication state - temporary solution without context
  // In a real app, you'd want to use localStorage or similar to persist this
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Notification system
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);
  
  // Show success message
  const handleSuccessMessage = (message: string) => {
    setNotification({ message, type: 'success' });
    setTimeout(() => setNotification(null), 5000);
  };
  
  // Show error message
  const handleErrorMessage = (message: string) => {
    setNotification({ message, type: 'error' });
    setTimeout(() => setNotification(null), 5000);
  };
  
  const login = async (email: string, password: string) => {
    try {
      // Actual API call to login endpoint
      const response = await api.post<{ 
        user: { 
          email: string; 
          username: string; 
          id: string 
        }; 
        token: string 
      }>('/auth/login', { email, password });
  
      // Store the authentication token
      storageUtils.storeAuthToken(response.token);
  
      // Set the auth header for future requests
      api.setAuthHeader(response.token);
  
      // Set current user and authentication state
      setCurrentUser(response.user);
      setIsAuthenticated(true);
  
      return { 
        success: true, 
        message: 'Login successful' 
      };
    } catch (error) {
      // Handle login errors
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };
  
  const register = async (username: string, email: string, password: string) => {
    try {
      // Call backend registration API
      const response = await api.post<{ 
        user: { 
          email: string; 
          username: string; 
          id: string 
        }; 
        token: string;
        message: string;
      }>('/auth/register', { username, email, password });
  
      // Store the authentication token
      storageUtils.storeAuthToken(response.token);
  
      // Set the auth header for future requests
      api.setAuthHeader(response.token);
  
      // Set current user and authentication state
      setCurrentUser(response.user);
      setIsAuthenticated(true);
  
      return { 
        success: true, 
        message: 'Registration successful' 
      };
    } catch (error) {
      // Handle registration errors
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  };
  
  const logout = () => {
    // Clear user data
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Clear the auth token (using the method you have available)
    // If you don't have a specific removal method, you can store an empty string
    storageUtils.storeAuthToken('');
    
    // Remove auth header from API
    // If this method doesn't exist, you can omit this line
    if (typeof api.removeAuthHeader === 'function') {
      api.removeAuthHeader();
    } else {
      // Alternative: set auth header to empty
      api.setAuthHeader('');
    }
  };
  
  // Simple ProtectedRoute component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <div className="App min-h-screen flex flex-col">
        {/* Provide auth-related props directly to Header */}
        <Header 
          currentUser={currentUser}
          logout={logout}
          isAuthenticated={isAuthenticated}
        />
        
        {/* Provide auth-related props directly to Navigation */}
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isAuthenticated={isAuthenticated}
        />
        
        {/* Show notification if exists */}
        {notification && (
          <div className="container mx-auto px-4 mt-4">
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          </div>
        )}
        
        <main className="flex-grow">
          <Routes>
            <Route 
              path="/login" 
              element={
                <AuthPage 
                  mode="login"
                  onLogin={login}
                  onRegister={register}
                />
              } 
            />
            <Route 
              path="/register" 
              element={
                <AuthPage 
                  mode="register"
                  onLogin={login}
                  onRegister={register}
                />
              } 
            />
            <Route 
              path="/UnifiedDashboard" 
              element={
                <ProtectedRoute>
                  <UnifiedDashboard
                    onSuccessMessage={handleSuccessMessage}
                    onErrorMessage={handleErrorMessage}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">Settings</h1>
                    <p>Settings page is under construction.</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/UnifiedDashboard" />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
};

export default App;