import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useContextState } from '../hooks/useContextState';
import type { User } from '../../../types';
import type { AuthContextType, AuthProviderProps } from '../../../types';
import { storageUtils } from '../utils/storage';
import {ProfileResponse,AuthResponse} from '../../../types';
// Create the context with an initial undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use the auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { loading, error, setLoading, executeOperation } = useContextState();
  const [token, setToken] = useState<string | null>(storageUtils.getAuthToken());
  const api = useApi();

  // Set up auth header when token changes
  useEffect(() => {
    if (token) {
      api.setAuthHeader(token);
    } else {
      api.removeAuthHeader();
    }
  }, []);

// Update the useEffect hook that runs when token changes
useEffect(() => {
  const loadUser = async (): Promise<void> => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Parse the JWT token to get user information
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      // Decode the payload part (which is base64 encoded)
      // We need to handle padding issues with base64 decoding
      const base64Url = tokenParts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        console.log('Token expired, logging out');
        storageUtils.storeAuthToken('');
        setToken(null);
        setCurrentUser(null);
      } else {
        // Use the decoded payload to set the user
        setCurrentUser({
          id: payload.id,
          email: payload.email,
          // If username isn't in the token, use the email prefix as a fallback
          username: payload.email.split('@')[0],
          created_at: new Date()
        });
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      // Only clear the token if there's an error parsing it
      // This prevents infinite loops
      storageUtils.storeAuthToken('');
      setToken(null);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  loadUser();
},[]);
    // Login
    const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
      const [data, success] = await executeOperation<AuthResponse>(
        async () => {
          return await api.post<AuthResponse>('/auth/login', { email, password });
        },
        'Login successful',
        'Login failed'
      );

      if (success && data) {
        storageUtils.storeAuthToken(data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        return { success: true };
      }

      return {
        success: false,
        message: error || 'Login failed'
      };
    };

    // Register
    const register = async (username: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
      const [data, success] = await executeOperation<AuthResponse>(
        async () => {
          return await api.post<AuthResponse>('/auth/register', { username, email, password });
        },
        'Registration successful',
        'Registration failed'
      );

      if (success && data) {
        storageUtils.storeAuthToken(data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        return { success: true };
      }

      return {
        success: false,
        message: error || 'Registration failed'
      };
    };

    const logout = (): void => {
      storageUtils.storeAuthToken('');
      setToken(null);
      setCurrentUser(null);
    };

    // Create value object with all properties required by AuthContextType
    const value: AuthContextType = {
      currentUser,
      login,
      register,
      logout,
      loading,
      error,  // Now included in the interface
      isAuthenticated: !!currentUser
    };

    return (
      <AuthContext.Provider value={value}>
        {!loading && children}
      </AuthContext.Provider>
    )}
