import React, { FormEvent, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Type for authentication mode
type AuthMode = 'login' | 'register';

// Type for form field
interface AuthField {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number;
  error?: string;
}

// Type for form data
interface AuthFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Type for form errors
interface AuthFormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

// Props for the AuthPage component
interface AuthPageProps {
  mode?: AuthMode;
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  onRegister: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
}

// Simple AuthForm component (to replace the imported one)
const AuthForm: React.FC<{
  title: string;
  fields: AuthField[];
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  submitButtonText: string;
  error?: string;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
  isSubmitting?: boolean;
}> = ({
  title,
  fields,
  onSubmit,
  submitButtonText,
  error,
  footerText,
  footerLinkText,
  footerLinkTo,
  isSubmitting = false
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">{title}</h1>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          {fields.map((field) => (
            <div key={field.id} className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                name={field.name}
                type={field.type}
                value={field.value}
                onChange={field.onChange}
                required={field.required}
                minLength={field.minLength}
                className={`w-full p-2 border ${
                  field.error ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {field.error && (
                <p className="text-red-500 text-xs mt-1">{field.error}</p>
              )}
            </div>
          ))}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 px-4 rounded-md transition duration-300`}
          >
            {isSubmitting ? 'Processing...' : submitButtonText}
          </button>
        </form>
        
        <p className="mt-4 text-center text-gray-600">
          {footerText} {' '}
          <a href={footerLinkTo} className="text-blue-600 hover:underline">
            {footerLinkText}
          </a>
        </p>
      </div>
    </div>
  );
};

const AuthPage: React.FC<AuthPageProps> = ({ 
  mode = 'login',
  onLogin,
  onRegister
}) => {
  const location = useLocation();
  const [currentMode, setCurrentMode] = useState<AuthMode>(mode);
  
  // Set mode based on current path if not provided
  useEffect(() => {
    if (location.pathname === '/login') {
      setCurrentMode('login');
    } else if (location.pathname === '/register') {
      setCurrentMode('register');
    }
  }, [location.pathname]);

  // Form state management
  const [values, setValues] = useState<AuthFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  // Reset form and errors when mode changes
  useEffect(() => {
    setValues({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setGeneralError('');
  }, [currentMode]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: AuthFormErrors = {};
    
    // For register mode, validate username
    if (currentMode === 'register') {
      if (!values.username) {
        newErrors.username = 'Username is required';
      } else if (values.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
    }
    
    // Validate email for both modes
    if (!values.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate password for both modes
    if (!values.password) {
      newErrors.password = 'Password is required';
    } else if (currentMode === 'register' && values.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // For register mode, validate password confirmation
    if (currentMode === 'register' && values.password !== values.confirmPassword) {
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
      let result;
      
      if (currentMode === 'login') {
        result = await onLogin(values.email, values.password);
      } else {
        result = await onRegister(values.username, values.email, values.password);
      }
      
      if (result.success) {
        navigate('/UnifiedDashboard');
      } else {
        setGeneralError(result.message || `${currentMode === 'login' ? 'Login' : 'Registration'} failed`);
      }
    } catch (error) {
      setGeneralError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamically build fields based on mode
  const getFields = (): AuthField[] => {
    const fields: AuthField[] = [];
    
    if (currentMode === 'register') {
      fields.push({
        id: 'username',
        name: 'username',
        type: 'text',
        label: 'Username',
        value: values.username,
        onChange: handleChange,
        required: true,
        error: errors.username
      });
    }
    
    fields.push(
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
        minLength: currentMode === 'register' ? 8 : undefined,
        error: errors.password
      }
    );
    
    if (currentMode === 'register') {
      fields.push({
        id: 'confirmPassword',
        name: 'confirmPassword',
        type: 'password',
        label: 'Confirm Password',
        value: values.confirmPassword,
        onChange: handleChange,
        required: true,
        error: errors.confirmPassword
      });
    }
    
    return fields;
  };

  // Dynamic props based on mode
  const title = currentMode === 'login' ? 'Login' : 'Register';
  const submitButtonText = title;
  const footerText = currentMode === 'login' 
    ? "Don't have an account?" 
    : "Already have an account?";
  const footerLinkText = currentMode === 'login' ? 'Register' : 'Login';
  const footerLinkTo = currentMode === 'login' ? '/register' : '/login';

  return (
    <AuthForm
      title={title}
      fields={getFields()}
      onSubmit={onSubmit}
      submitButtonText={submitButtonText}
      error={generalError}
      footerText={footerText}
      footerLinkText={footerLinkText}
      footerLinkTo={footerLinkTo}
      isSubmitting={isSubmitting}
    />
  );
};

export default AuthPage;