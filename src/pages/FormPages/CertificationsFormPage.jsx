// src/pages/FormPages/CertificationsFormPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import TextInput from '../../components/UI/TextInput';
import Button from '../../components/UI/Button';
// import Alert from "../../components/UI/Alert"; // To be replaced by Toast
import Toast from '../../components/UI/Toast'; // Import Toast
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { apiService } from '../../utils/api';

const CertificationsFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const initialCertificationState = {
    name: '',
    issuingOrganization: '',
    dateIssued: '',
    imageUrl: '',
    imagePublicId: '',
    credentialUrl: '',
  };

  const [certification, setCertification] = useState(initialCertificationState);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // const [error, setError] = useState(""); // Replaced by toast state
  // const [successMessage, setSuccessMessage] = useState(""); // Replaced by toast state
  const [validationErrors, setValidationErrors] = useState({});
  const [toast, setToast] = useState({ message: '', type: '', show: false }); // Add toast state

  // Function to show toast
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, show: true });
  }, []);

  const clearMessages = useCallback(() => {
    // setError(""); // Not needed if using toast primarily for submit feedback
    // setSuccessMessage(""); // Not needed
    setValidationErrors({});
    // Optionally hide toast if it's still visible from a previous action unrelated to form submission
    // setToast(prev => ({ ...prev, show: false }));
  }, []);

  // Helper function to format date to YYYY-MM-DD
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const dateObj = new Date(dateString);
      const year = dateObj.getUTCFullYear();
      const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getUTCDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      clearMessages(); // Clears validation errors
      setToast({ message: '', type: '', show: false }); // Clear any existing toast
      apiService
        .getCertificationById(id)
        .then((response) => {
          const fetchedCert = response.data?.data;
          if (fetchedCert) {
            setCertification({
              name: fetchedCert.name || '',
              issuingOrganization: fetchedCert.issuingOrganization || '',
              dateIssued: formatDateForInput(fetchedCert.dateIssued),
              imageUrl: fetchedCert.imageUrl || '',
              imagePublicId: fetchedCert.imagePublicId || '',
              credentialUrl: fetchedCert.credentialUrl || '',
            });
            if (fetchedCert.imageUrl) {
              setImagePreview(fetchedCert.imageUrl);
            }
          } else {
            showToast(
              'Certification data not found or in unexpected format.',
              'error'
            );
          }
        })
        .catch((err) => {
          showToast(
            err.response?.data?.message ||
              'Failed to load certification details.',
            'error'
          );
          console.error('Error fetching certification:', err);
        })
        .finally(() => setLoading(false));
    } else {
      setCertification(initialCertificationState);
      setImageFile(null);
      setImagePreview('');
      clearMessages();
      setToast({ message: '', type: '', show: false }); // Clear toast for new form
    }
  }, [id, isEditMode, clearMessages, showToast]); // Added showToast

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCertification((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    // Clear general error/success toasts if user starts typing
    // setToast(prev => ({ ...prev, show: false }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : '');
    if (validationErrors.image) {
      setValidationErrors((prev) => ({ ...prev, image: undefined }));
    }
    // setToast(prev => ({ ...prev, show: false }));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setCertification((prev) => ({
      ...prev,
      imageUrl: '',
      imagePublicId: isEditMode ? prev.imagePublicId : '',
    }));
    // setToast(prev => ({ ...prev, show: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setToast({ message: '', type: '', show: false }); // Clear previous toast

    let localErrors = {};
    if (!certification.name.trim())
      localErrors.name = 'Certification name is required.';
    if (!certification.issuingOrganization.trim())
      localErrors.issuingOrganization = 'Issuing organization is required.';
    if (!certification.dateIssued) {
      localErrors.dateIssued = 'Date issued is required.';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectDate = new Date(certification.dateIssued + 'T00:00:00Z');
      if (selectDate > today) {
        localErrors.dateIssued = 'Date issued cannot be in the future.';
      }
    }
    if (
      certification.credentialUrl &&
      !/^https?:\/\/.+/.test(certification.credentialUrl)
    ) {
      localErrors.credentialUrl = 'Credential URL must be a valid URL.';
    }

    if (Object.keys(localErrors).length > 0) {
      setValidationErrors(localErrors);
      showToast('Please correct the validation errors.', 'error'); // Show toast for validation errors
      return;
    }

    setSubmitting(true);
    try {
      let uploadedImageUrl = certification.imageUrl;
      let uploadedImagePublicId = certification.imagePublicId;

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const imageUploadResponse = await apiService.uploadImage(formData);
        if (
          imageUploadResponse.data.success &&
          imageUploadResponse.data.data &&
          imageUploadResponse.data.data.imageUrl
        ) {
          uploadedImageUrl = imageUploadResponse.data.data.imageUrl;
          uploadedImagePublicId = imageUploadResponse.data.data.publicId;
        } else {
          let uploadErrorMessage =
            'Image upload failed or returned unexpected data.';
          if (imageUploadResponse.data && !imageUploadResponse.data.success) {
            uploadErrorMessage =
              imageUploadResponse.data.message || uploadErrorMessage;
          } else if (!imageUploadResponse.data?.data?.imageUrl) {
            uploadErrorMessage = 'Image URL not found in upload response.';
          }
          console.error(
            'Image Upload Response Issue:',
            imageUploadResponse.data
          );
          throw new Error(uploadErrorMessage); // This will be caught and shown as a toast
        }
      } else if (
        !certification.imageUrl &&
        isEditMode &&
        certification.imagePublicId
      ) {
        uploadedImageUrl = '';
        uploadedImagePublicId = certification.imagePublicId;
      }

      const payload = {
        name: certification.name,
        issuingOrganization: certification.issuingOrganization,
        dateIssued: certification.dateIssued,
        imageUrl: uploadedImageUrl,
        imagePublicId: uploadedImagePublicId,
        credentialUrl: certification.credentialUrl,
      };

      let response;
      if (isEditMode) {
        response = await apiService.updateCertification(id, payload);
      } else {
        response = await apiService.createCertification(payload);
      }

      showToast(
        // Use showToast for success
        response.data?.message ||
          `Certification ${isEditMode ? 'updated' : 'created'} successfully!`,
        'success'
      );
      setTimeout(() => {
        navigate('/admin/certifications');
      }, 1500);
    } catch (err) {
      console.error('Submit Error:', err);
      const apiError = err.response?.data;

      if (
        apiError &&
        Array.isArray(apiError.data) &&
        apiError.message === 'Validation failed'
      ) {
        const newValidationErrors = {};
        apiError.data.forEach((valError) => {
          const fieldName = valError.path;
          if (fieldName) {
            newValidationErrors[fieldName] = valError.msg;
          }
        });
        setValidationErrors(newValidationErrors);
        showToast(
          // Use showToast for validation errors
          apiError.message || 'Validation failed. Please check the form.',
          'error'
        );
      } else if (apiError?.errors && Array.isArray(apiError.errors)) {
        const newValidationErrors = {};
        apiError.errors.forEach((valError) => {
          let fieldName = valError.param || valError.path;
          newValidationErrors[fieldName] = valError.msg;
        });
        setValidationErrors(newValidationErrors);
        showToast(
          // Use showToast for these validation errors too
          apiError.message || 'Validation failed. Please check the form.',
          'error'
        );
      } else {
        showToast(
          // Use showToast for general errors
          apiError?.message ||
            err.message ||
            'Failed to save certification. Please try again.',
          'error'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && isEditMode) {
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
          {isEditMode ? 'Edit Certification' : 'Create New Certification'}
        </h1>
        {/* Alert components removed, Toast will be rendered at the end */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6"
        >
          {/* ... form inputs ... */}
          <TextInput
            label="Certification Name"
            name="name"
            value={certification.name}
            onChange={handleChange}
            error={validationErrors.name}
            required
            placeholder="e.g., Google Data Analytics Certificate"
          />
          <TextInput
            label="Issuing Organization"
            name="issuingOrganization"
            value={certification.issuingOrganization}
            onChange={handleChange}
            error={validationErrors.issuingOrganization}
            required
            placeholder="e.g., Coursera, Google, CNCF"
          />
          <TextInput
            label="Date Issued"
            name="dateIssued"
            type="date"
            value={certification.dateIssued}
            onChange={handleChange}
            error={validationErrors.dateIssued}
            required
            placeholder="YYYY-MM-DD"
          />

          {/* Image Upload Section */}
          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Certificate Image (Optional)
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageFileChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-white dark:hover:file:bg-gray-500"
            />
            {imagePreview && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Image Preview:
                </p>
                <img
                  src={imagePreview}
                  alt="Certificate Preview"
                  className="max-w-xs h-auto rounded-md shadow-sm border border-gray-200 dark:border-gray-700"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Image
                </button>
              </div>
            )}
            {validationErrors.imageUrl && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.imageUrl}
              </p>
            )}
          </div>

          <TextInput
            label="Credential Public URL (Optional)"
            name="credentialUrl"
            type="url"
            value={certification.credentialUrl}
            onChange={handleChange}
            error={validationErrors.credentialUrl}
            placeholder="e.g., https://www.credly.com/badges/..."
            helperText="Link to your certificate on Credly, LinkedIn, or other public host."
          />
          {isEditMode && certification.credentialUrl && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Current Link:{' '}
              <a
                href={certification.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Credential
              </a>
            </p>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/certifications')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || loading}
            >
              {submitting
                ? isEditMode
                  ? 'Saving...'
                  : 'Creating...'
                : isEditMode
                  ? 'Save Changes'
                  : 'Create Certification'}
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

export default CertificationsFormPage;
