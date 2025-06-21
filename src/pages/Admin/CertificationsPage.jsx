import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Alert from '../../components/UI/Alert'; // Assuming this handles both success and error
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../utils/api';
import ConfirmationModal from '../../components/UI/ConfirmationModal';

const CertificationsPage = () => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // <-- NEW STATE for success messages
  const { user } = useAuth();

  const [itemToDelete, setItemToDelete] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const loadCertifications = async () => {
      setLoading(true);
      setError(null);
      setSuccessMessage(null); // Clear messages on new load
      try {
        const response = await apiService.getCertifications();
        const apiData = response?.data?.data;

        if (Array.isArray(apiData)) {
          setCertifications(apiData);
        } else {
          setCertifications([]);
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to fetch certifications.';
        setError(errorMessage);
        setCertifications([]);
        console.error('Error fetching certifications:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCertifications();
  }, []);

  const handleDeleteInitiate = (certId, certName, imagePublicId) => {
    // Clear any previous messages when initiating a new action
    setError(null);
    setSuccessMessage(null);
    setItemToDelete({
      id: certId,
      name: certName,
      imagePublicId: imagePublicId,
    });
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete?.id) return;
    if (user?.accessLevel !== 'admin') {
      setError("You don't have permission to delete certifications."); // Set error
      setShowConfirmModal(false);
      setItemToDelete(null);
      return;
    }
    try {
      const response = await apiService.deleteCertification(itemToDelete.id); // Get response
      setCertifications(
        certifications.filter((cert) => cert._id !== itemToDelete.id)
      );
      setSuccessMessage(
        response?.data?.message || 'Certification deleted successfully!'
      ); // <-- Set success message from server
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete certification.'
      );
    } finally {
      setShowConfirmModal(false);
      setItemToDelete(null);
      // You might want a timeout for success/error messages to auto-hide
      setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000); // Messages disappear after 5 seconds
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-0">
            Certifications
          </h1>
          {user?.accessLevel === 'admin' && (
            <Link
              to="/admin/certifications/new"
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 w-full sm:w-auto justify-center"
            >
              <FaPlus className="mr-2" /> New Certification
            </Link>
          )}
        </div>
        {/* --- Display Messages --- */}
        {successMessage && (
          <Alert type="success" message={successMessage} className="mb-4" />
        )}{' '}
        {/* <-- NEW */}
        {error && <Alert type="error" message={error} className="mb-4" />}
        {/* --- End Display Messages --- */}
        {certifications.length === 0 && !error && !loading ? ( // Ensure loading is false
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-gray-600 dark:text-gray-300">
              No certifications found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    Issuing Body
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                    Date Issued
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {certifications.map((cert) => (
                  <tr
                    key={cert._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-4">
                      {cert.imageUrl ? (
                        <img
                          src={cert.imageUrl}
                          alt={cert.name || 'Certificate'}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {cert.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell">
                      {cert.issuingOrganization}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell">
                      {new Date(cert.dateIssued).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium">
                      {user?.accessLevel === 'admin' && (
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/admin/certifications/edit/${cert._id}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit Certification"
                          >
                            <FaEdit className="text-lg" />
                          </Link>
                          <button
                            onClick={() =>
                              handleDeleteInitiate(
                                cert._id,
                                cert.name,
                                cert.imagePublicId
                              )
                            }
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete Certification"
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
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Certification"
        message={`Are you sure you want to delete the certification "${
          itemToDelete?.name || 'this item'
        }"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </AdminLayout>
  );
};

export default CertificationsPage;
