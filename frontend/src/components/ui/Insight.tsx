import React from 'react';

interface InsightProps {
  label: string;
  text: string;
}

/**
 * Insight component for displaying financial insights
 */
export const Insight: React.FC<InsightProps> = ({ label, text }) => (
  <div className="pt-4 border-t">
    <h3 className="font-medium text-gray-700">{label}</h3>
    <p className="mt-2">{text}</p>
  </div>
);
