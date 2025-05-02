import React, { FormEvent, ReactNode } from 'react';
import { FormField } from './FormField';
import { Section, SubmitButton } from '../ui';

interface FinancialFormProps {
  title: string;
  fields: {
    id: string;
    name: string;
    type: string;
    label: string;
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
  }[];
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  submitText: string;
  loading: boolean;
  error?: string;
  children?: ReactNode;
}

export const FinancialForm: React.FC<FinancialFormProps> = ({
  title,
  fields,
  onSubmit,
  submitText,
  loading,
  error,
  children
}) => {
  return (
    <Section title={title}>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={onSubmit}>
        {fields.map(field => (
          <FormField
            key={field.id}
            id={field.id}
            name={field.name}
            type={field.type}
            label={field.label}
            value={field.value}
            defaultValue={field.defaultValue}
            onChange={field.onChange}
            error={field.error}
            required={field.required}
          />
        ))}
        {children}
        <SubmitButton loading={loading} text={submitText} />
      </form>
    </Section>
  );
};
