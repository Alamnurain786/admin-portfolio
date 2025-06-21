import React from 'react';

const Alert = ({ type = 'info', message, onClose }) => {
  const types = {
    success: 'bg-green-100 border-l-4 border-green-500 text-green-700',
    error: 'bg-red-100 border-l-4 border-red-500 text-red-700',
    warning: 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700',
    info: 'bg-blue-100 border-l-4 border-blue-500 text-blue-700',
  };

  return (
    <div className={`${types[type]} p-4 my-4 relative`} role="alert">
      <p>{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-sm"
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
