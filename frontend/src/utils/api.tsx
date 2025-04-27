// Benefits of This Pattern

// Centralized Configuration: All API-related settings are in one place
// Authentication Handling: Token management is automatic and consistent
// Code Reusability: Prevents duplicating configuration across files
// Maintainability: Changes to API URL or auth mechanism only need to be made once

// Debugging Considerations
// When debugging API-related issues:

// Check that the API_BASE_URL matches your backend server
// Verify token storage and retrieval in localStorage
// Use browser network tools to confirm headers are being set correctly
// Consider adding response interceptors for global error handling
import axios from 'axios';
//sets the base URL for all API requests 
const API_BASE_URL = 'http://localhost:5003/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// this right here is a powerful feature inside axios that lets you modify requests before theyre sent:
// it checks if theres an authentication token stored in the browsers localstorage  and if a token exists it adds it to the authorization header using the bearer scheme, this automatically handles authentication for all the requests without having to manually add the token each time
api.interceptors.request.use((config) => {
   // Gets the authentication token from local storage (if it exists)
  const token = localStorage.getItem('token');
    // If a token exists, add it to the Authorization header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
    // Returns the modified config
  return config;
});
// this makes the configured axios instance avaialable to import in other files
export default api;

