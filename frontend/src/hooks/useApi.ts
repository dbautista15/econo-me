
import api from '../utils/api';

export interface ApiMethods {
  // HTTP methods
  get: <T>(endpoint: string, options?: any) => Promise<T>;
  post: <T>(endpoint: string, data: any, options?: any) => Promise<T>;
  put: <T>(endpoint: string, data: any, options?: any) => Promise<T>;
  delete: <T>(endpoint: string, options?: any) => Promise<T>;
  patch: <T>(endpoint: string, data: any, options?: any) => Promise<T>;
  
  // Auth header methods
  setAuthHeader: (token: string) => void;
  removeAuthHeader: () => void;
}

export function useApi(): ApiMethods {
  return api;
}