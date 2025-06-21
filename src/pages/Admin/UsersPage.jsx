// src/pages/Admin/UsersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaEdit,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaTrash,
} from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
// import Alert from "../../components/UI/Alert"; // Replaced by Toast for most messages
import Toast from '../../components/UI/Toast'; // Import Toast
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../utils/api';
import ConfirmationModal from '../../components/UI/ConfirmationModal';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null); // Replaced by toast for transient errors
  const { user: loggedInUser } = useAuth();
  const location = useLocation();

  // State for Toast
  const [toast, setToast] = useState({ message: '', type: '', show: false });

  // State for Delete Confirmation Modal
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null); // Stores { id, name }

  // State for Toggle Status Confirmation Modal
  const [showToggleConfirmModal, setShowToggleConfirmModal] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null); // Stores { id, name, currentStatus }

  // Function to show toast
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, show: true });
  }, []);

  // Effect to show toast message from navigation state (e.g., after create/edit)
  useEffect(() => {
    if (location.state?.message) {
      showToast(location.state.message, location.state.type || 'success');
      // Clear the location state to prevent re-showing toast on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showToast]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    // setError(null); // Clear previous main error
    setToast({ message: '', type: '', show: false }); // Clear previous toast
    try {
      const response = await apiService.getUsers();
      let allUsers = response.data.data || response.data || [];
      if (!Array.isArray(allUsers)) {
        console.error('Fetched users data is not an array:', allUsers);
        allUsers = [];
      }
      const filteredUsers = allUsers.filter(
        (userItem) => userItem.accessLevel === 'user' // Or any other primary filter
      );
      setUsers(filteredUsers);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch users.';
      showToast(errorMsg, 'error');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- Delete User Logic ---
  const handleDeleteInitiate = (userId, userName) => {
    if (userId === loggedInUser?._id) {
      showToast('You cannot delete your own account from here.', 'error');
      return;
    }
    setUserToDelete({ id: userId, name: userName });
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete?.id) return;

    if (loggedInUser?.accessLevel !== 'admin') {
      showToast("You don't have permission to delete users.", 'error');
      setShowDeleteConfirmModal(false);
      setUserToDelete(null);
      return;
    }

    try {
      await apiService.deleteUser(userToDelete.id);
      setUsers((prevUsers) =>
        prevUsers.filter((u) => u._id !== userToDelete.id)
      );
      showToast(`User '${userToDelete.name}' deleted successfully!`, 'success');
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to delete user.',
        'error'
      );
      console.error('Error deleting user:', err);
    } finally {
      setShowDeleteConfirmModal(false);
      setUserToDelete(null);
    }
  };

  // --- Toggle User Status Logic ---
  const handleToggleStatusInitiate = (userId, userName, currentStatus) => {
    if (loggedInUser?.accessLevel !== 'admin') {
      showToast("You don't have permission to change user status.", 'error');
      return;
    }
    if (userId === loggedInUser?._id) {
      showToast('You cannot disable your own account.', 'error');
      return;
    }
    setUserToToggle({ id: userId, name: userName, currentStatus });
    setShowToggleConfirmModal(true);
  };

  const handleToggleStatusConfirm = async () => {
    if (!userToToggle?.id) return;

    const { id, name, currentStatus } = userToToggle;
    const newStatus = !currentStatus;

    try {
      await apiService.updateUser(id, newStatus); // Or a dedicated toggle endpoint
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === id ? { ...u, isActive: newStatus } : u))
      );
      showToast(
        `User '${name}' status updated to ${
          newStatus ? 'Active' : 'Disabled'
        }.`,
        'success'
      );
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to update user status.',
        'error'
      );
      console.error('Error updating user status:', err);
    } finally {
      setShowToggleConfirmModal(false);
      setUserToToggle(null);
    }
  };

  const hasAdminAccess = loggedInUser?.accessLevel === 'admin';

  if (loading && users.length === 0) {
    // Show full page loader only on initial load
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-0">
            User Management
          </h1>
          {hasAdminAccess && (
            <Link
              to="/admin/users/new"
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 w-full sm:w-auto justify-center"
            >
              <FaPlus className="mr-2" /> Add New User
            </Link>
          )}
        </div>

        {/* Replaced Alert with Toast, which is positioned globally by its component */}

        {users.length === 0 && !loading ? ( // Check !loading here
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">No users found.</p>
            {/* Optionally, you can add a button to retry fetching if there was an error */}
            {/* <Button onClick={fetchUsers}>Retry</Button> */}
          </div>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                    Access Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((userItem) => (
                  <tr
                    key={userItem._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {userItem.username}
                      {userItem._id === loggedInUser?._id && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          (You)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell">
                      {userItem.email}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userItem.accessLevel === 'admin'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : userItem.accessLevel === 'editor'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {userItem.accessLevel}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userItem.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {userItem.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium">
                      {hasAdminAccess && (
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/admin/users/edit/${userItem._id}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Edit User"
                          >
                            <FaEdit className="text-lg" />
                          </Link>
                          <button
                            onClick={() =>
                              handleToggleStatusInitiate(
                                userItem._id,
                                userItem.username,
                                userItem.isActive
                              )
                            }
                            className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              userItem.isActive
                                ? 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300'
                                : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                            } ${
                              userItem._id === loggedInUser?._id
                                ? 'cursor-not-allowed opacity-50'
                                : ''
                            }`}
                            title={
                              userItem.isActive ? 'Disable User' : 'Enable User'
                            }
                            disabled={userItem._id === loggedInUser?._id}
                          >
                            {userItem.isActive ? (
                              <FaToggleOff className="text-lg" />
                            ) : (
                              <FaToggleOn className="text-lg" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteInitiate(
                                userItem._id,
                                userItem.username
                              )
                            }
                            className={`text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              userItem._id === loggedInUser?._id
                                ? 'cursor-not-allowed opacity-50'
                                : ''
                            }`}
                            title="Delete User"
                            disabled={userItem._id === loggedInUser?._id}
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm User Deletion"
        message={`Are you sure you want to delete user '${userToDelete?.name}'? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />

      {/* Confirmation Modal for Toggling Status */}
      <ConfirmationModal
        isOpen={showToggleConfirmModal}
        onClose={() => setShowToggleConfirmModal(false)}
        onConfirm={handleToggleStatusConfirm}
        title={`Confirm User Status Change`}
        message={`Are you sure you want to ${
          userToToggle?.currentStatus ? 'disable' : 'enable'
        } user '${userToToggle?.name}'?`}
        confirmText={userToToggle?.currentStatus ? 'Disable' : 'Enable'}
        cancelText="Cancel"
        confirmButtonClass={
          userToToggle?.currentStatus
            ? 'bg-yellow-600 hover:bg-yellow-700'
            : 'bg-green-600 hover:bg-green-700'
        }
      />

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

export default UsersPage;
