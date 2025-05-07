import { FormEvent } from 'react';

export interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number;
}

export interface AuthFormProps {
  title: string;
  fields: FormField[];
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  submitButtonText: string;
  error: string;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
}

export interface IncomeEntryFormProps {
  onAddIncome: (amount: number, date: string) => Promise<boolean>;
}