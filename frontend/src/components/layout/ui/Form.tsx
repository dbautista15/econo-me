import React, { InputHTMLAttributes, ReactNode } from 'react';

// Base Input Props
interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  showLabel?: boolean;
  helpText?: string;
}

// Input Component
export const Input: React.FC<BaseInputProps> = ({ 
  label, 
  error, 
  className = '', 
  showLabel = true, 
  helpText,
  ...props 
}) => (
  <div className="mb-4">
    {showLabel && label && (
      <label className="block text-gray-700 mb-2" htmlFor={props.id}>
        {label}
      </label>
    )}
    
    <input
      {...props}
      className={`w-full p-2 border ${error ? 'border-red-500' : 'border-gray-300'} 
                  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${props.id}-error` : undefined}
    />
    
    {helpText && <p className="text-gray-500 text-xs mt-1">{helpText}</p>}
    {error && <p id={`${props.id}-error`} className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// Select Input Props
interface SelectProps {
  id?: string;
  name?: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  className?: string;
  showLabel?: boolean;
  helpText?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

// Select Component
export const Select: React.FC<SelectProps> = ({ 
  id,
  name,
  label, 
  value, 
  onChange, 
  options, 
  error, 
  className = '',
  showLabel = true,
  helpText,
  placeholder,
  required = false,
  disabled = false
}) => (
  <div className="mb-4">
    {showLabel && label && (
      <label className="block text-gray-700 mb-2" htmlFor={id}>
        {label}
      </label>
    )}
    
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full p-2 border ${error ? 'border-red-500' : 'border-gray-300'} 
                rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      required={required}
      disabled={disabled}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    
    {helpText && <p className="text-gray-500 text-xs mt-1">{helpText}</p>}
    {error && <p id={`${id}-error`} className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// Common Button Props
interface ButtonProps {
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

// Button Component
export const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
}) => {
  // Variant styles
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-300 hover:bg-gray-400 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  };

  // Size styles
  const sizeStyles = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4',
    lg: 'py-3 px-5 text-lg',
  };

  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={`font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 
                 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed 
                 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={onClick}
    >
      {loading ? 'Processing...' : children}
    </button>
  );
};

// Submit Button Component (extended from Button)
export const SubmitButton: React.FC<Omit<ButtonProps, 'children' | 'type'> & { text: string }> = ({
  text,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
}) => (
  <Button
    type="submit"
    variant={variant}
    size={size}
    loading={loading}
    disabled={disabled}
    className={`w-full ${className}`}
  >
    {text}
  </Button>
);

// Form Field Component (combines Input with form field features)
export const FormField: React.FC<BaseInputProps> = (props) => (
  <Input {...props} />
);

// Form Group Component for grouping related form fields
interface FormGroupProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  title,
  description,
  className = '',
}) => (
  <div className={`mb-6 p-4 border border-gray-200 rounded-md ${className}`}>
    {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
    {description && <p className="text-gray-600 text-sm mb-4">{description}</p>}
    {children}
  </div>
);