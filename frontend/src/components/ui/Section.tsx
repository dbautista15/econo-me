import React from 'react';

const Section = ({ title, children, full = false }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md ${full ? 'md:col-span-2' : ''}`}>
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

export default Section;
