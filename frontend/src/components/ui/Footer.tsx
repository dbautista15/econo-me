import React from 'react';

export const Footer: React.FC = () => (
  <footer className="bg-gray-800 text-white mt-12">
    <div className="container mx-auto px-4 py-6">
      <p className="text-center text-gray-400">© {new Date().getFullYear()} Econo-me. All rights reserved.</p>
    </div>
  </footer>
);