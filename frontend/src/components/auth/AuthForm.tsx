import React, { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ErrorAlert } from '../ui';
import { FormField } from '../common/FormField';

export interface AuthField {
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

export interface AuthFormProps {
  title: string;
  fields: AuthField[];
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  submitButtonText: string;
  error?: string;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
  isSubmitting?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
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
        
        {error && <ErrorAlert message={error} />}
        
        <form onSubmit={onSubmit}>
          {fields.map((field) => (
            <FormField
              key={field.id}
              id={field.id}
              name={field.name}
              type={field.type}
              label={field.label}
              value={field.value}
              onChange={field.onChange}
              required={field.required}
              minLength={field.minLength}
              error={field.error}
            />
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
          <Link to={footerLinkTo} className="text-blue-600 hover:underline">
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
};