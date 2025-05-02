import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useForm from '../../hooks/useForm';
import { AuthForm } from './AuthForm';
import { validators } from '../../utils/validators';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

export const Login: React.FC = () => {
  const { values, handleChange } = useForm<LoginFormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};
    
    // Validate email
    if (!values.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate password
    if (!values.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await login(values.email, values.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setGeneralError(result.message || 'Login failed');
      }
    } catch (error) {
      setGeneralError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    {
      id: 'email',
      name: 'email',
      type: 'email',
      label: 'Email',
      value: values.email,
      onChange: handleChange,
      required: true,
      error: errors.email
    },
    {
      id: 'password',
      name: 'password',
      type: 'password',
      label: 'Password',
      value: values.password,
      onChange: handleChange,
      required: true,
      error: errors.password
    }
  ];

  return (
    <AuthForm
      title="Login"
      fields={fields}
      onSubmit={onSubmit}
      submitButtonText="Login"
      error={generalError}
      footerText="Don't have an account?"
      footerLinkText="Register"
      footerLinkTo="/register"
      isSubmitting={isSubmitting}
    />
  );
};