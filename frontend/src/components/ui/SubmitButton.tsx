import React from 'react';

interface SubmitButtonProps {
  text: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Submit button component with loading state
 */
export const SubmitButton: React.FC<SubmitButtonProps> = ({ 
  text, 
  loading = false, 
  disabled = false,
  className = ''
}) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {loading ? 'Processing...' : text}
  </button>
);
