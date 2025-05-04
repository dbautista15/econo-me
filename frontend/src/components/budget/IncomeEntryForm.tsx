import React, { FormEvent, useState } from 'react';
import { useIncomeManagement } from '../../hooks';
import useForm from '../../hooks/useForm';
import { validators } from '../../utils/validators';
import { FinancialForm } from '../common/FinancialForm';
import { transformations } from '../../utils/transformations';

interface IncomeFormData {
  amount: string;
  date: string;
}

interface IncomeFormErrors {
  amount?: string;
  date?: string;
}

interface IncomeEntryFormProps {
  initialAmount?: string;
  initialDate?: string;
  onAddIncomeSuccess?: () => void;
}

export const IncomeEntryForm: React.FC<IncomeEntryFormProps> = ({ 
  initialAmount = '',
  initialDate = new Date().toISOString().split('T')[0],
  onAddIncomeSuccess
}) => {
  const { values, handleChange, resetForm } = useForm<IncomeFormData>({
    amount: initialAmount,
    date: initialDate
  });
  
  const [errors, setErrors] = useState<IncomeFormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  
  const { addIncome, loading } = useIncomeManagement({
    onSuccess: () => {
      resetForm();
      if (onAddIncomeSuccess) onAddIncomeSuccess();
    },
    onError: (msg) => setGeneralError(msg)
  });

  const validateForm = (): boolean => {
    const formErrors = validators.validateIncomeForm(
      values.amount,
      values.date
    );
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateForm()) {
      return;
    }
    
    const amount = transformations.parseAmount(values.amount);
    await addIncome(amount, values.date);
  };

  const fields = [
    {
      id: 'amount',
      name: 'amount',
      type: 'number',
      label: 'Amount',
      value: values.amount,
      onChange: handleChange,
      error: errors.amount,
      required: true
    },
    {
      id: 'date',
      name: 'date',
      type: 'date',
      label: 'Date',
      value: values.date,
      onChange: handleChange,
      error: errors.date,
      required: true
    }
  ];

  return (
    <FinancialForm
      title="Add Income Entry"
      fields={fields}
      onSubmit={handleSubmit}
      submitText="Add Income"
      loading={loading}
      error={generalError}
    />
  );
};