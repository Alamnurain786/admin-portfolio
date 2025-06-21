// src/components/UI/Toast.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isVisible) return; // Don't set timer if already hidden

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, duration);

    // Clear timeout if the component unmounts or message/type changes
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  // Determine styling based on type
  let bgColor = 'bg-green-500';
  let icon = (
    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );

  if (type === 'error') {
    bgColor = 'bg-red-500';
    icon = (
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    );
  } else if (type === 'info') {
    bgColor = 'bg-blue-500';
    icon = (
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 2a1 1 0 100 2h.01a1 1 0 000-2H10z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (!isVisible) return null;

  return createPortal(
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg text-white flex items-center z-50 transition-all duration-300 transform ${bgColor}`}
    >
      {icon}
      <span>{message}</span>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-4 text-white hover:text-gray-100 focus:outline-none"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>,
    document.body // Portal to document.body to ensure it's on top of everything
  );
};

export default Toast;
