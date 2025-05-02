import React from 'react';
import { SuggestionCardProps } from '../../../../types';

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, applyLimit }) => {
  // Ensure daily is a number for calculations
  const dailyAmount = typeof suggestion.daily === 'string' 
    ? parseFloat(suggestion.daily) 
    : suggestion.daily;
  
  return (
    <div className="mt-6 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-md md:col-span-2">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Suggested Spending</h3>
      <ul className="list-disc list-inside ml-4 text-yellow-900 text-sm mt-2">
        <li><strong>Pay frequency:</strong> {suggestion.frequency}</li>
        <li><strong>Next paycheck:</strong> {suggestion.nextDate}</li>
        <li><strong>Daily limit:</strong> ${dailyAmount.toFixed(2)}</li>
      </ul>
      <button
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
        onClick={() => applyLimit(dailyAmount * 7)}
      >
        Apply Weekly Limit
      </button>
    </div>
  );
};