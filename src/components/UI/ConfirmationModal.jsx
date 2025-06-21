// src/components/UI/ConfirmationModal.jsx
import React from 'react';
import Button from './Button';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {title || 'Confirm Action'}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {message || 'Are you sure you want to proceed?'}
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {' '}
            {/* Or primary based on action */}
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
