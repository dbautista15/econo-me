import React from 'react';
import { transformations } from '../../utils/transformations';

interface ProgressProps {
  label: string;
  percent: number;
  color: string;
}

/**
 * Progress bar component
 */
export const Progress: React.FC<ProgressProps> = ({ label, percent, color }) => (
  <div>
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>{transformations.formatPercentage(percent)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
      <div
        className={`${color} h-2 rounded-full`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      ></div>
    </div>
  </div>
);
