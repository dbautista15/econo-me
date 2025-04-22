import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CategoryProvider } from './context/CategoryContext';
import Login from './components/Login';
import Register from './components/Registration';
import ProtectedRoute from './components/ProtectedRoute';
import { Header, Navigation, Footer, NotificationMessage } from './components/Layout';
import Dashboard from './components/Dashboard';
import ExpenseTracker from './components/ExpenseTracker';
import IncomeGoals from './components/IncomeGoals';
import DashboardContainer from './components/DashboardContainer';
import './App.css';

const App = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const location = useLocation();    // Add this effect to automatically update activeTab based on URL
    useEffect(() => {
        console.log('Current location:', location.pathname);
        const path = location.pathname;
        if (path.includes('/dashboard')) {
            console.log('Setting active tab to dashboard');
            setActiveTab('dashboard');
        } else if (path.includes('/expenses')) {
            console.log('Setting active tab to expenses');
            setActiveTab('expenses');
        } else if (path.includes('/goals')) {
            console.log('Setting active tab to goals');
            setActiveTab('goals');
        }
    }, [location]);
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
            <CategoryProvider> {/* Add this provider */}
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
                                    <DashboardContainer />
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
                                        income={0}
                                        setIncome={() => {}} // Provide a dummy function
                                        spendingLimit={0}
                                        setSpendingLimit={() => {}} // Provide a dummy function
                                        savingsGoal={0}
                                        setSavingsGoal={() => {}} // Provide a dummy function
                                        expensesByCategory={{}}
                                        // categoryBudgets={{}}
                                        categoryBudgets={{}}
                                        setCategoryBudgets={() => {}} // Provide a dummy function
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
            </CategoryProvider> 
        </AuthProvider>
    );
};

export default App;