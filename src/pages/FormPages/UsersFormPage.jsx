import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import TextInput from '../../components/UI/TextInput';
import PasswordInput from '../../components/UI/PasswordInput';
import Button from '../../components/UI/Button';
// import Alert from "../../components/UI/Alert"; // To be replaced by Toast
import Toast from '../../components/UI/Toast'; // Import Toast
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { apiService } from '../../utils/api';
// import { useAuth } from "../../context/AuthContext"; // token not directly used here

const UsersFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    accessLevel: 'user',
    adminSecretKey: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // const [error, setError] = useState(""); // Replaced by toast
  const [validationErrors, setValidationErrors] = useState({});
  const [toast, setToast] = useState({ message: '', type: '', show: false });

  // Function to show toast
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, show: true });
    // Toast component can handle its own timeout for hiding
  }, []);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      apiService
        .getUserById(id) // This should now work after adding to api.js
        .then((response) => {
          const fetchedUser = response.data.data;
          setUserForm({
            username: fetchedUser.username || '',
            email: fetchedUser.email || '',
            password: '', // Always clear password field on edit load
            accessLevel: fetchedUser.accessLevel || 'user',
            isActive:
              typeof fetchedUser.isActive === 'boolean'
                ? fetchedUser.isActive
                : true, // Set isActive from fetched data
            adminSecretKey: '', // Reset secret key field
          });
        })
        .catch((err) => {
          showToast(
            err.response?.data?.message || 'Failed to load user data.',
            'error'
          );
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setToast({ message: '', type: '', show: false }); // Clear previous toast

    let errors = {};
    if (!userForm.username.trim()) errors.username = 'Username is required.';
    if (!userForm.email.trim()) errors.email = 'Email is required.';
    if (userForm.email.trim() && !/\S+@\S+\.\S+/.test(userForm.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!isEditMode && !userForm.password) {
      errors.password = 'Password is required for new users.';
    } else if (userForm.password && userForm.password.length < 8) {
      // Assuming backend requires 8
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (!userForm.accessLevel.trim()) {
      errors.accessLevel = 'Access level is required.';
    }

    // Validate adminSecretKey if creating an admin user
    if (userForm.accessLevel === 'admin' && !userForm.adminSecretKey.trim()) {
      errors.adminSecretKey = 'Admin Secret Key is required for Admin role.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToast('Please correct the validation errors.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const dataToSubmit = {
        username: userForm.username,
        email: userForm.email,
        accessLevel: userForm.accessLevel,
        isActive: userForm.isActive,
      };

      if (userForm.password) {
        // Only include password if provided
        dataToSubmit.password = userForm.password;
      }

      // Include adminSecretKey only if creating a new admin user
      if (userForm.accessLevel === 'admin') {
        if (userForm.adminSecretKey) {
          // Only include if provided
          dataToSubmit.adminSecretKey = userForm.adminSecretKey;
        } else if (!isEditMode) {
          // If creating admin and no key, rely on backend validation
          // For edit mode, if admin role is kept and key not entered, it might not be needed by backend
          // unless backend always requires it for setting/keeping admin role.
          // The backend validation for adminSecretKey on PUT is conditional.
        }
      }

      if (isEditMode) {
        // Use updateUserDetails for general updates
        await apiService.updateUserDetails(id, dataToSubmit);
        showToast('User updated successfully!', 'success');
      } else {
        // This is for CREATE mode
        await apiService.createUser(dataToSubmit);
        showToast('User created successfully!', 'success');
      }
      // Navigate after a short delay to allow toast to be seen
      setTimeout(() => {
        navigate('/admin/users', {
          state: {
            message: isEditMode
              ? 'User updated successfully!'
              : 'User created successfully!',
          },
        });
      }, 1500);
    } catch (err) {
      const apiError = err.response?.data;
      if (apiError?.errors && Array.isArray(apiError.errors)) {
        // Check if errors is an array
        const newValidationErrors = {};
        apiError.errors.forEach((e) => {
          if (e.path) {
            // Backend error structure might use 'path' for field name
            newValidationErrors[e.path] = e.msg;
          } else if (e.field) {
            // Or 'field'
            newValidationErrors[e.field] = e.message;
          }
        });
        setValidationErrors(newValidationErrors);
        showToast(
          apiError.message || 'Validation failed. Please check the form.',
          'error'
        );
      } else {
        showToast(apiError?.message || 'Failed to save user.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {isEditMode ? 'Edit User' : 'Create New User'}
        </h1>
        {/* Alert component removed */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4"
        >
          <TextInput
            label="Username"
            name="username"
            value={userForm.username}
            onChange={handleChange}
            error={validationErrors.username}
            required
            placeholder="e.g., johndoe"
          />
          <TextInput
            label="Email"
            name="email"
            type="email"
            value={userForm.email}
            onChange={handleChange}
            error={validationErrors.email}
            required
            placeholder="e.g., john.doe@example.com"
          />
          <PasswordInput
            label="Password"
            name="password"
            value={userForm.password}
            onChange={handleChange}
            error={validationErrors.password}
            required={!isEditMode}
            placeholder={
              isEditMode
                ? 'Leave blank to keep current password'
                : 'Enter password (min 8 chars, incl. U/L/N/S)'
            }
            helpText={
              !isEditMode
                ? 'Min 8 characters, with uppercase, lowercase, number, and special character.'
                : ''
            }
          />
          <div className="mb-4">
            <label
              htmlFor="accessLevel"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Access Level
            </label>
            <select
              name="accessLevel"
              id="accessLevel"
              value={userForm.accessLevel}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="user">User</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            {validationErrors.accessLevel && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.accessLevel}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="isActive"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Active Status
            </label>
            <select
              name="isActive"
              id="isActive"
              value={userForm.isActive}
              onChange={(e) =>
                setUserForm((prev) => ({
                  ...prev,
                  isActive: e.target.value === 'true',
                }))
              }
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            {validationErrors.isActive && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.isActive}
              </p>
            )}
          </div>

          {/* Conditional Admin Secret Key Input */}
          {userForm.accessLevel === 'admin' && ( // Simplified condition: show if accessLevel is admin
            <PasswordInput
              label="Admin Secret Key"
              name="adminSecretKey"
              value={userForm.adminSecretKey}
              onChange={handleChange}
              error={validationErrors.adminSecretKey}
              // Required validation is handled in handleSubmit
              placeholder="Enter admin secret key"
              helpText={
                isEditMode
                  ? 'Required if changing to or confirming Admin role and if backend requires it.'
                  : 'Required to create an Admin.'
              }
            />
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/users')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting
                ? isEditMode
                  ? 'Saving...'
                  : 'Creating...'
                : isEditMode
                  ? 'Save Changes'
                  : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '', show: false })}
        />
      )}
    </AdminLayout>
  );
};

export default UsersFormPage;
