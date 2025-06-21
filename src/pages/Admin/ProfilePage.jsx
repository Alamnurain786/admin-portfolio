// src/pages/Admin/ProfilePage.jsx
import React, { useState } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Alert from '../../components/UI/Alert';
import PasswordInput from '../../components/UI/PasswordInput'; // Import the new component
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../utils/api'; // Uncomment this when using real API

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New password and confirm password do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call for password change
      // In a real app:
      const response = await apiService.changePassword({
        currentPassword,
        newPassword,
      });
      // setTimeout(() => {
      // if (currentPassword === "password123") {
      setSuccessMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      // } else {
      //   setErrorMessage("Incorrect current password.");
      // }
      // setLoading(false);
      // }, 1000);
    } catch (err) {
      console.error('Password change error:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to change password.'
      );
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
          <p className="text-gray-600 dark:text-gray-300 ml-4">
            Loading user profile...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          My Profile
        </h1>

        {successMessage && (
          <Alert type="success" message={successMessage} className="mb-4" />
        )}
        {errorMessage && (
          <Alert type="error" message={errorMessage} className="mb-4" />
        )}

        {/* User Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            User Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username:
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100 font-semibold">
                {user.username}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email:
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Access Level:
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100 capitalize">
                {user.accessLevel}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <PasswordInput
              label="Current Password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <PasswordInput
              label="New Password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <PasswordInput
              label="Confirm New Password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                disabled={loading}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProfilePage;
