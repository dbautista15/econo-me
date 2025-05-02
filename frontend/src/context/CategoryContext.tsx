import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useApi } from '../hooks/useApi';
import { useContextState } from '../hooks/useContextState';
import { CategoryContextType } from '../../../types'

// Default categories to use as fallback
const DEFAULT_CATEGORIES = [
  'Food', 'Transportation', 'Housing', 'Utilities', 
  'Entertainment', 'Healthcare', 'Dining Out', 'Shopping'
];

// Create the context with an initial undefined value
const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// Props type for the provider component
interface CategoryProviderProps {
  children: ReactNode;
}

export function useCategories(): CategoryContextType {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}

export function CategoryProvider({ children }: CategoryProviderProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const { loading, error, setError, executeOperation } = useContextState();
  const api = useApi();

  // Load categories from API
  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      const [data, success] = await executeOperation<string[]>(
        async () => {
          const response = await api.get('/categories');
          // If we get valid categories, use them, otherwise use defaults
          if (response && Array.isArray(response) && response.length > 0) {
            return response;
          }
          return DEFAULT_CATEGORIES;
        },
        'Categories loaded successfully',
        'Failed to load categories'
      );
      
      if (success && data) {
        setCategories(data);
      } else {
        // Fallback to default categories on failure
        setCategories(DEFAULT_CATEGORIES);
      }
    };

    fetchCategories();
  }, []);

  // Function to add a new category
  const addCategory = async (newCategory: string): Promise<boolean> => {
    // Validate the category
    if (!newCategory || categories.includes(newCategory)) {
      setError('Category is empty or already exists');
      return false;
    }

    const [_, success] = await executeOperation(
      async () => {
        // Here you would typically call an API to add the category
        // await api.post('/categories', { name: newCategory });
        
        // For now, just return the category
        return newCategory;
      },
      'Category added successfully',
      'Failed to add category'
    );
    
    if (success) {
      // Update local state
      setCategories([...categories, newCategory]);
      return true;
    }
    
    return false;
  };

  const value: CategoryContextType = {
    categories,
    loading,
    error,
    addCategory
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}