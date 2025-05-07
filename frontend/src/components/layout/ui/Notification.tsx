import React from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  type?: NotificationType;
  message: string;
  fullWidth?: boolean;
  className?: string;
  onClose?: () => void;
}

/**
 * Unified notification component for all types of messages (success, error, warning, info)
 */
export const Notification: React.FC<NotificationProps> = ({ 
  type = 'info', 
  message, 
  fullWidth = false,
  className = '',
  onClose
}) => {
  if (!message) return null;
  
  // Base styles for all notifications
  const baseStyles = "mb-4 p-4 rounded-md";
  
  // Width styles
  const widthStyles = fullWidth ? "md:col-span-3 w-full" : "";
  
  // Type-specific styles
  const typeStyles = {
    success: "bg-green-100 text-green-700 border border-green-200",
    error: "bg-red-100 text-red-700 border border-red-200",
    warning: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    info: "bg-blue-100 text-blue-700 border border-blue-200"
  };
  
  return (
    <div className={`${baseStyles} ${typeStyles[type]} ${widthStyles} ${className}`}>
      <div className="flex justify-between items-center">
        <div>{message}</div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;