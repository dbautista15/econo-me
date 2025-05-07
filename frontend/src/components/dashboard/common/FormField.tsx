import React from 'react';

interface FormFieldProps {
  id: string;
  name: string;
  type: string;
  label: string;
  value?: string | number;  // Make value optional
  defaultValue?: string | number;  // Make defaultValue optional
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number;
  error?: string;  // Make error optional
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  type,
  label,
  value,
  defaultValue,
  onChange,
  required = false,
  minLength,
  error
}) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 mb-2" htmlFor={id}>
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        className={`w-full p-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        required={required}
        minLength={minLength}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};
