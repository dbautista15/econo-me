// App.tsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CategoryProvider } from './context/CategoryContext';

// Components - Auth
import {Login} from './components/auth/Login';
import {Register} from './components/auth/Registration';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Components - Layout
import { Header, Navigation, Footer, NotificationMessage } from '../../frontend/src/components/ui/';

// Features
import DashboardContainer from './components/containers/DashboardContainer';
//import Settings from '../src/components/settings/settings'; // You'll need to create this component

// Styles
import './styles/App.css';
import './styles/index.css';
import { TabType,MessageType } from '../../types';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const location = useLocation();
    
    // Update activeTab based on URL
    useEffect(() => {
        console.log('Current location:', location.pathname);
        const path = location.pathname;
        
        if (path.includes('/dashboard')) {
            console.log('Setting active tab to dashboard');
            setActiveTab('dashboard');
        } else if (path.includes('/settings')) {
            console.log('Setting active tab to settings');
            setActiveTab('settings');
        }
    }, [location]);
    
    // Show notification messages
    const showMessage = (message: string, type: MessageType): void => {
        if (type === 'success') {
            setSuccessMessage(message);
            setTimeout(() => setSuccessMessage(''), 3003);
        } else {
            setErrorMessage(message);
            setTimeout(() => setErrorMessage(''), 3003);
        }
    };

    return (
        <AuthProvider>
            <CategoryProvider>
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
                                        <DashboardContainer 
                                            onSuccessMessage={(msg: string) => showMessage(msg, 'success')}
                                            onErrorMessage={(msg: string) => showMessage(msg, 'error')}
                                        />
                                    </ProtectedRoute>
                                }
                            />
                            
                            {/* <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute>
                                        <Settings 
                                            onSuccessMessage={(msg: string) => showMessage(msg, 'success')}
                                            onErrorMessage={(msg: string) => showMessage(msg, 'error')}
                                        />
                                    </ProtectedRoute>
                                }
                            /> */}
                        </Routes>
                    </main>

                    <Footer />
                </div>
            </CategoryProvider>
        </AuthProvider>
    );
};

export default App;