// src/context/CategoryContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const CategoryContext = createContext();

export function useCategories() {
  return useContext(CategoryContext);
}

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load categories from API
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get('/categories');
        
        // If we get valid categories, use them
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setCategories(response.data);
        } else {
          // Fallback to default categories
          setCategories(['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Healthcare', 'Dining Out', 'Shopping']);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        // Set fallback categories on error
        setCategories(['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment']);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Function to add a new category
  const addCategory = async (newCategory) => {
    // Validate the category
    if (!newCategory || categories.includes(newCategory)) {
      return false;
    }

    try {
      // Here you would typically call an API to add the category
      // await api.post('/categories', { name: newCategory });
      
      // Update local state
      setCategories([...categories, newCategory]);
      return true;
    } catch (error) {
      setError('Failed to add category');
      return false;
    }
  };

  const value = {
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