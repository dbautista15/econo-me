import React, { InputHTMLAttributes } from 'react';
import { Input } from './Input';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showLabel?: boolean;
}

/**
 * Form field component with validation
 */
export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  error, 
  showLabel = true,
  ...props 
}) => {
  return <Input label={showLabel ? label : ''} error={error} {...props} />;
};