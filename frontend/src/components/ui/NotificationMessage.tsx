import React from 'react';
import { NotificationMessageProps } from '../../../../types';

export const NotificationMessage: React.FC<NotificationMessageProps> = ({ 
  message, 
  type 
}) => {
  if (!message) return null;
  
  const baseStyles = "mb-4 p-4 rounded-md";
  const typeStyles = type === 'success' 
    ? "bg-green-100 text-green-700" 
    : "bg-red-100 text-red-700";
  
  return (
    <div className={`${baseStyles} ${typeStyles}`}>
      {message}
    </div>
  );
};