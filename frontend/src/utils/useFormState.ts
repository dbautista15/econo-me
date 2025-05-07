import { useState } from 'react';

/**
 * A simple form state hook to replace external form libraries
 * Provides state management for form values with type safety
 */
export function useFormState<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  // Handle input changes from form controls
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form to initial values
  const resetForm = () => {
    setValues(initialValues);
  };

  return {
    values,
    handleChange,
    resetForm,
    setValues
  };
}

export default useFormState;