// src/pages/Admin/ProjectsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Alert from '../../components/UI/Alert';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../utils/api'; // Uncomment this when using real API
import ConfirmationModal from '../../components/UI/ConfirmationModal'; // Assuming you have this component

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState(null); // For success alerts

  //used ConfirmationModal
  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    // In a real app, you would fetch this from your API:
    try {
      const response = await apiService.getProjects();
      // Adjust based on your actual API response structure for projects
      const apiData =
        response?.data?.data || response?.data?.projects || response?.data;

      if (Array.isArray(apiData)) {
        setProjects(apiData);
      } else {
        console.warn('Fetched projects data is not an array:', apiData);
        setProjects([]);
        setError('Could not parse projects data from the server.');
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch projects.';
      setError(errMsg);
      setProjects([]); // Clear projects on error
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDeleteInitiate = (projId, projName) => {
    clearMessages(); // Clear previous messages
    setItemToDelete({ id: projId, name: projName });
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete?.id) return;

    if (user?.accessLevel !== 'admin') {
      alert("You don't have permission to delete projects.");
      setShowConfirmModal(false);
      setItemToDelete(null);
      return;
    }
    setLoading(true); // Indicate loading during delete
    clearMessages();

    try {
      await apiService.deleteProject(itemToDelete.id);
      setProjects(projects.filter((proj) => proj._id !== itemToDelete.id));
      setSuccessMessage(`Project "${itemToDelete.name}" deleted successfully!`);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete project.';
      setError(errMsg);
      console.error('Error deleting project:', err);
    } finally {
      setShowConfirmModal(false);
      setItemToDelete(null);
      setLoading(false); // Stop loading indicator
      // Optional: Auto-clear message after a few seconds
      setTimeout(clearMessages, 5000);
    }
  };

  if (loading && projects.length === 0) {
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
            Projects
          </h1>
          {user?.accessLevel === 'admin' && (
            <Link
              to="/admin/projects/new"
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 w-full sm:w-auto justify-center"
            >
              <FaPlus className="mr-2" /> New Project
            </Link>
          )}
        </div>

        {/* Display Success and Error Alerts */}
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={clearMessages}
            className="mb-4"
          />
        )}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={clearMessages}
            className="mb-4"
          />
        )}
        {loading && (
          <div className="text-center my-4">
            <LoadingSpinner />
          </div>
        )}

        {!loading && projects.length === 0 && !error ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-gray-600 dark:text-gray-300">
              No projects found.
            </p>
            {user?.accessLevel === 'admin' && (
              <Link
                to="/admin/projects/new"
                className="mt-4 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-150"
              >
                Add Your First Project
              </Link>
            )}
          </div>
        ) : !loading && projects.length > 0 ? (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {projects.map((proj) => (
                  <tr
                    key={proj._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {proj.name || proj.title}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell">
                      {proj.category}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          proj.status === 'Completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : proj.status === 'In Progress'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {proj.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium">
                      {user?.accessLevel === 'admin' && (
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/admin/projects/edit/${proj._id}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit Project"
                          >
                            <FaEdit className="text-lg" />
                          </Link>
                          <button
                            onClick={() =>
                              handleDeleteInitiate(
                                proj._id,
                                proj.title || proj.name
                              )
                            }
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete Project"
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
        ) : null}
        {/* Confirmation Modal */}
        {showConfirmModal && itemToDelete && (
          <ConfirmationModal
            isOpen={showConfirmModal}
            onClose={() => {
              setShowConfirmModal(false);
              setItemToDelete(null); // Clear item to delete when closing
            }}
            onConfirm={handleDeleteConfirm}
            title="Delete Project"
            // Display the project name in the confirmation message
            message={`Are you sure you want to delete the project "${itemToDelete.name}"? This action cannot be undone.`}
            confirmText="Delete"
            confirmButtonClass="bg-red-600 hover:bg-red-700" // Example class
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default ProjectsPage;
