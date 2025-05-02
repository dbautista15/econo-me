// Updated DashboardContainer with proper handling of success/error messages

import React, { useState } from 'react';
import { DashboardContainerProps } from '../../../../types';
import Dashboard from '../dashboard/Dashboard';
import { useFinancialData } from '../../hooks';

const DashboardContainer: React.FC<DashboardContainerProps> = ({
  onSuccessMessage,
  onErrorMessage
}) => {
  // Use financial data hook with callbacks to the parent component
  const financialData = useFinancialData({
    onSuccess: onSuccessMessage,
    onError: onErrorMessage,
    onUpdate: () => {} // No-op or implement if needed
  });

  
  // Pass financialData to Dashboard component
  return (
    <Dashboard
      {...financialData}
      onSuccessMessage={onSuccessMessage}
      onErrorMessage={onErrorMessage}
    />
  );
};

export default DashboardContainer;