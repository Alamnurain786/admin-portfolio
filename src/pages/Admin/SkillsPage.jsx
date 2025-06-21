// src/pages/Admin/SkillsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
// import Alert from "../../components/UI/Alert"; // No longer needed for primary messages
import Toast from '../../components/UI/Toast'; // Import Toast
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../utils/api';
import ConfirmationModal from '../../components/UI/ConfirmationModal';

const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null); // Replaced by toast
  // const [successMessage, setSuccessMessage] = useState(null); // Replaced by toast
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);

  // State for toast notification
  const [toast, setToast] = useState({ message: '', type: '', show: false });

  // Function to show toast
  const showToast = useCallback(
    (message, type = 'success', duration = 3000) => {
      setToast({ message, type, show: true });
      // Toast component itself can handle auto-hide.
      // If you need to manually hide it after duration from here:
      setTimeout(
        () => setToast({ message: '', type: '', show: false }),
        duration
      );
    },
    []
  );

  // Effect to display success message from navigation
  useEffect(() => {
    if (location.state?.message) {
      showToast(location.state.message, 'success');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname, showToast]);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    // Clear previous toast if it was an error from a previous fetch attempt
    // setToast({ message: "", type: "", show: false }); // Optional: if you want to clear any toast before fetching
    try {
      const response = await apiService.getSkills();
      setSkills(response.data?.data || response.data || []);
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to fetch skills.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]); // Added showToast to dependencies

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleDeleteInitiate = (skillId, skillName) => {
    setSkillToDelete({ id: skillId, name: skillName });
    setShowConfirmModal(true);
    setToast({ message: '', type: '', show: false }); // Clear any active toast
  };

  const handleDeleteConfirm = async () => {
    if (!skillToDelete?.id) return;

    if (user?.accessLevel !== 'admin') {
      showToast("You don't have permission to delete skills.", 'error');
      setShowConfirmModal(false);
      setSkillToDelete(null);
      return;
    }

    try {
      await apiService.deleteSkill(skillToDelete.id);
      setSkills((prevSkills) =>
        prevSkills.filter((skill) => skill._id !== skillToDelete.id)
      );
      showToast(
        `Skill "${skillToDelete.name || 'Item'}" deleted successfully!`,
        'success'
      );
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to delete skill.',
        'error'
      );
    } finally {
      setShowConfirmModal(false);
      setSkillToDelete(null);
    }
  };

  if (loading && skills.length === 0) {
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
            Skills
          </h1>
          {user?.accessLevel === 'admin' && (
            <Link
              to="/admin/skills/new"
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 w-full sm:w-auto justify-center"
            >
              <FaPlus className="mr-2" /> New Skill
            </Link>
          )}
        </div>

        {/* Alert components are removed, Toast will handle messages */}
        {/* {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
            className="mb-4"
          />
        )}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-4"
          />
        )} */}

        {loading && skills.length > 0 && (
          <div className="text-center py-4 text-gray-600 dark:text-gray-400">
            <LoadingSpinner size="small" /> Refreshing skills...
          </div>
        )}

        {!loading && skills.length === 0 ? ( // Removed !error condition as errors are handled by toast
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">No skills found.</p>
            {user?.accessLevel === 'admin' && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                You can add a new skill using the "New Skill" button.
              </p>
            )}
          </div>
        ) : (
          !loading &&
          skills.length > 0 && (
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                      Proficiency
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                      Category
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {skills.map((skill) => (
                    <tr
                      key={skill._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">
                        {skill.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            skill.proficiency === 'Expert'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : skill.proficiency === 'Advanced'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : skill.proficiency === 'Intermediate'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {skill.proficiency}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell">
                        {skill.category}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium">
                        {user?.accessLevel === 'admin' && (
                          <div className="flex justify-end space-x-2">
                            <Link
                              to={`/admin/skills/edit/${skill._id}`}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit Skill"
                            >
                              <FaEdit className="text-lg" />
                            </Link>
                            <button
                              onClick={() =>
                                handleDeleteInitiate(skill._id, skill.name)
                              }
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                              title="Delete Skill"
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
          )
        )}
      </div>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSkillToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Skill"
        message={`Are you sure you want to delete the skill "${
          skillToDelete?.name || 'this item'
        }"? This action cannot be undone.`}
        confirmText="Delete"
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

export default SkillsPage;
