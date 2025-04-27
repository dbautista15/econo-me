import React from 'react';

const SubmitButton = ({ text, loading }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  >
    {loading ? 'Saving...' : text}
  </button>
);

export default SubmitButton;
