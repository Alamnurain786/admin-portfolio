// src/components/UI/PasswordInput.jsx
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons

const PasswordInput = ({ label, id, className = '', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {/* Optional Label (if provided) */}
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      {/* Input field with relative positioning for the icon */}
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'} // Toggle type based on state
          className={`w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-10 focus:ring-blue-500 focus:border-blue-500 ${className}`}
          {...props} // Pass through other standard input props like value, onChange, required, placeholder, name etc.
        />
        {/* Toggle Button for Eye Icon */}
        <button
          type="button" // Important: Prevent form submission when clicking the icon
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 dark:text-gray-400 focus:outline-none"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <FaEyeSlash className="h-5 w-5" /> // Icon for hiding password
          ) : (
            <FaEye className="h-5 w-5" /> // Icon for showing password
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
