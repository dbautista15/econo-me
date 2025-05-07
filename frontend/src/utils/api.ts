// utils/api.ts - Updated with auth header methods

// Import response types
import {ApiSuccess, ApiError} from '../../../types/api/responses'
// Define base URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';

// Type for request options
interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

// Default headers for all requests
let defaultHeaders: Record<string, string> = {
  'Content-Type': 'application/json'
};

// Main API client
const api = {
  /**
   * Set authentication header for all future requests
   */
  setAuthHeader(token: string): void {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  },

  /**
   * Remove authentication header
   */
  removeAuthHeader(): void {
    delete defaultHeaders['Authorization'];
  },

  /**
   * Send a GET request to the API
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return sendRequest<T>('GET', endpoint, null, options);
  },
  
  /**
   * Send a POST request to the API
   */
  async post<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
    return sendRequest<T>('POST', endpoint, data, options);
  },
  
  /**
   * Send a PUT request to the API
   */
  async put<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
    return sendRequest<T>('PUT', endpoint, data, options);
  },
  
  /**
   * Send a DELETE request to the API
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return sendRequest<T>('DELETE', endpoint, null, options);
  },
  
  /**
   * Send a PATCH request to the API
   */
  async patch<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
    return sendRequest<T>('PATCH', endpoint, data, options);
  }
};

/**
 * Helper function to send HTTP requests
 */
async function sendRequest<T>(
  method: string,
  endpoint: string,
  data: any = null,
  options: RequestOptions = {}
): Promise<T> {
  // Build the full URL
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Prepare headers by combining default headers with any provided in options
  const headers: Record<string, string> = {
    ...defaultHeaders,
    ...(options.headers || {})
  };
  
  // Build fetch options
  const fetchOptions: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined
  };
  
  try {
    // Send the request
    const response = await fetch(url, fetchOptions);
    
    // Parse the JSON response
    const responseData = await response.json();
    
    // Check if request was successful
    if (!response.ok) {
      const errorData = responseData as ApiError;
      
      // Handle authentication errors
      if (response.status === 401) {
        // Clear auth token from storage
        localStorage.removeItem('authToken'); // Adjust to your storage method
        
        // Redirect to login if not already there
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    // Type the successful response
    const successData = responseData as ApiSuccess<T>;
    
    // Return the data property or the entire response
    return (successData.data !== undefined ? successData.data : responseData) as T;
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw error;
  }
}

export default api;