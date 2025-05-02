import React, { FormEvent, useState } from 'react';
import { useBudgetManagement } from '../../hooks';
import useForm from '../../hooks/useForm';
import { validators } from '../../utils/validators';
import { FinancialForm } from '../common/FinancialForm';
import { transformations } from '../../utils/transformations';
import { FormErrors } from '../../../../types';
import { SavingsGoalFormProps } from '../../../../types';
interface SavingsFormData {
  goal: string;
}

export const SavingsGoalForm: React.FC<SavingsGoalFormProps> = ({ 
  goal, 
  onSubmit,
  loading 
}) => {
  const { values, handleChange } = useForm<SavingsFormData>({
    goal: goal.toString()
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  
  const { updateSavingsGoal, loading: hookLoading } = useBudgetManagement({
    onError: (msg) => setGeneralError(msg)
  });

  const validateForm = (): boolean => {
    const formErrors = validators.validateSavingsGoal(values.goal);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateForm()) {
      return;
    }
    
    const goalAmount = transformations.parseAmount(values.goal);
    onSubmit(goalAmount);
  };
  

  const fields = [
    {
      id: 'goal',
      name: 'goal',
      type: 'number',
      label: 'Monthly Savings Goal ($)',
      value: values.goal,
      onChange: handleChange,
      error: errors.goal,
      required: true
    }
  ];

  return (
    <FinancialForm
      title="Set Savings Goal"
      fields={fields}
      onSubmit={handleSubmit}
      submitText="Update Savings Goal"
      loading={loading} 
      error={generalError}
    />
  );
};

