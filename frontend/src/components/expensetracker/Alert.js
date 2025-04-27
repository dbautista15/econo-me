import React from 'react';

const Alert = ({ type, message }) => {
  const base = "mb-4 p-4 rounded-md md:col-span-3";
  const style = type === 'success'
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";

  return <div className={`${base} ${style}`}>{message}</div>;
};

export default Alert;