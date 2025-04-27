import React from 'react';

const Insight = ({ label, text }) => (
  <div className="pt-4 border-t">
    <h3 className="font-medium text-gray-700">{label}</h3>
    <p className="mt-2">{text}</p>
  </div>
);

export default Insight;
