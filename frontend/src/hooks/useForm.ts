// hooks/useForm.ts
import { useState, ChangeEvent } from 'react';

function useForm<T>(initialState: T) {
  const [values, setValues] = useState<T>(initialState);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };
  
  const resetForm = (): void => {
    setValues(initialState);
  };
  
  return { values, handleChange, resetForm, setValues };
}

export default useForm;