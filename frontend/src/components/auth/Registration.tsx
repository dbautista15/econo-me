import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useForm from '../../hooks/useForm';
import { AuthForm } from './AuthForm';
import { validators } from '../../utils/validators';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const Register: React.FC = () => {
  const { values, handleChange } = useForm<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors = {};
    
    // Validate username
    if (!values.username) {
      newErrors.username = 'Username is required';
    } else if (values.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    // Validate email
    if (!values.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate password
    if (!values.password) {
      newErrors.password = 'Password is required';
    } else if (values.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Validate password confirmation
    if (values.password !== values.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const result = await register(values.username, values.email, values.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setGeneralError(result.message || 'Registration failed');
      }
    } catch (error) {
      setGeneralError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    {
      id: 'username',
      name: 'username',
      type: 'text',
      label: 'Username',
      value: values.username,
      onChange: handleChange,
      required: true,
      error: errors.username
    },
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
      minLength: 8,
      error: errors.password
    },
    {
      id: 'confirmPassword',
      name: 'confirmPassword',
      type: 'password',
      label: 'Confirm Password',
      value: values.confirmPassword,
      onChange: handleChange,
      required: true,
      error: errors.confirmPassword
    }
  ];

  return (
    <AuthForm
      title="Register"
      fields={fields}
      onSubmit={onSubmit}
      submitButtonText="Register"
      error={generalError}
      footerText="Already have an account?"
      footerLinkText="Login"
      footerLinkTo="/login"
      isSubmitting={isSubmitting}
    />
  );
};