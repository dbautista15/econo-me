import React from 'react';

const Progress = ({ label, percent, color }) => (
  <div>
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>{percent.toFixed(0)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
      <div
        className={`${color} h-2 rounded-full`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      ></div>
    </div>
  </div>
);

export default Progress;
