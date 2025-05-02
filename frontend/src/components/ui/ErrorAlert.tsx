import React from 'react';
import { Alert } from './Alert';

interface ErrorAlertProps {
  message: string;
}

/**
 * Specialized Alert component for error messages
 */
export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  if (!message) return null;
  
  return <Alert type="error" message={message} />;
};
