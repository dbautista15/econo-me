import React, { FormEvent, useState } from 'react';
import { useBudgetManagement } from '../../hooks';
import useForm from '../../hooks/useForm';
import { validators } from '../../utils/validators';
import { FinancialForm } from '../common/FinancialForm';
import { transformations } from '../../utils/transformations';
import { SpendingLimitFormProps } from '../../../../types';
import { FormErrors } from '../../../../types';
interface SpendingLimitFormData {
  limit: string;
}

export const SpendingLimitForm: React.FC<SpendingLimitFormProps> = ({ 
  limit, 
  onSubmit, 
  loading 
}) => {
  const { values, handleChange } = useForm<SpendingLimitFormData>({
    limit: limit.toString()
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  
  const validateForm = (): boolean => {
    const formErrors = validators.validateSpendingLimit(values.limit);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateForm()) {
      return;
    }
    
    const limitAmount = transformations.parseAmount(values.limit);
    onSubmit(limitAmount);
  };

  const fields = [
    {
      id: 'limit',
      name: 'limit',
      type: 'number',
      label: 'Monthly Spending Limit ($)',
      value: values.limit,
      onChange: handleChange,
      error: errors.limit,
      required: true
    }
  ];

  return (
    <FinancialForm
      title="Set Spending Limit"
      fields={fields}
      onSubmit={handleSubmit}
      submitText="Update Spending Limit"
      loading={loading}
      error={generalError}
    />
  );
};