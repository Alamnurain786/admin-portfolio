// src/pages/Admin/SkillFormPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import TextInput from '../../components/UI/TextInput';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { apiService } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const SkillFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEditMode = Boolean(id);

  const [skill, setSkill] = useState({
    name: '',
    proficiency: 'Intermediate',
    category: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Added for success messages
  const [validationErrors, setValidationErrors] = useState({});

  const clearMessages = useCallback((clearSuccess = true) => {
    setError('');
    if (clearSuccess) {
      setSuccessMessage('');
    }
    setValidationErrors({});
  }, []);
  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      // Assuming clearMessages() or a similar function to clear previous errors/success messages exists
      if (typeof clearMessages === 'function') {
        clearMessages();
      } else {
        setError(''); // Clear previous error
        // setSuccessMessage(""); // Clear previous success message if you have one
      }

      apiService
        .getSkillById(id)
        .then((response) => {
          // 1. Check if the response and the nested data structure are valid
          if (
            response &&
            response.data &&
            response.data.data &&
            typeof response.data.data === 'object'
          ) {
            const fetchedSkill = response.data.data;

            // 2. Ensure the fetched skill has essential properties (optional but good practice)
            //    This helps prevent errors if the backend ever returns an incomplete object.
            if (fetchedSkill._id && typeof fetchedSkill.name === 'string') {
              // 3. Set the state with the fetched skill data.
              //    Ensure the 'skill' state object structure in useState
              //    and the properties accessed by your input fields match 'fetchedSkill'.
              setSkill({
                name: fetchedSkill.name || '',
                proficiency: fetchedSkill.proficiency || 'Beginner', // Provide defaults if necessary
                category: fetchedSkill.category || '',
                // Add any other fields your form uses from the skill object
                // For example, if your initial skill state in useState is:
                // { name: "", proficiency: "Beginner", category: "", notes: "" }
                // then you'd also want to set:
                // notes: fetchedSkill.notes || "",
              });
            } else {
              console.error(
                'Fetched skill data is missing essential properties:',
                fetchedSkill
              );
              setError('Incomplete skill data received from server.');
            }
          } else {
            // This means the API response structure was not as expected.
            console.error(
              'Unexpected API response structure for getSkillById:',
              response
            );
            setError('Failed to parse skill data from API response.');
          }
        })
        .catch((err) => {
          console.error('Failed to fetch skill:', err);
          // Attempt to display a more specific error message from the backend if available
          const message =
            err.response?.data?.message ||
            err.message ||
            'Failed to load skill. An error occurred.';
          setError(message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!isEditMode) {
      // Reset form for create mode if needed, or ensure initial state is correct
      setSkill({
        name: '',
        proficiency: 'Beginner',
        category: '' /* other initial fields */,
      });
      setLoading(false);
    }
  }, [
    id,
    isEditMode /* any other dependencies like showToast or clearMessages if used from props/context */,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSkill((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    clearMessages(false); // Clear only error messages, keep success message
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages(true); // Clear all messages, including previous success, before new submission

    // Basic Frontend Validation (can be expanded)
    let localErrors = {};
    if (!skill.name.trim()) localErrors.name = 'Skill name is required.';
    if (!skill.category.trim()) localErrors.category = 'Category is required.';
    // Proficiency is a select with a default, so less likely to be empty unless options change

    if (Object.keys(localErrors).length > 0) {
      setValidationErrors(localErrors);
      setError('Please correct the highlighted errors.'); // Set a general error message
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (isEditMode) {
        response = await apiService.updateSkill(id, skill);
      } else {
        response = await apiService.createSkill(skill);
      }
      setSuccessMessage(
        response.data?.message ||
          `Skill ${isEditMode ? 'updated' : 'created'} successfully!`
      );
      setTimeout(() => {
        navigate('/admin/skills');
      }, 1500); // Delay navigation to show success message
    } catch (err) {
      console.error('Submit Error:', err);
      const apiError = err.response?.data;

      if (
        apiError &&
        Array.isArray(apiError.data) &&
        apiError.message === 'Validation failed'
      ) {
        // Handles error structure: { success: false, message: "Validation failed", data: [{ path: "field", msg: "..."}] }
        const newValidationErrors = {};
        apiError.data.forEach((valError) => {
          if (valError.path) {
            newValidationErrors[valError.path] = valError.msg;
          }
        });
        setValidationErrors(newValidationErrors);
        setError(
          apiError.message || 'Validation failed. Please check the form.'
        );
      } else if (apiError?.errors && Array.isArray(apiError.errors)) {
        // Handles error structure: { success: false, message: "Validation failed", errors: [{ param: "field", msg: "..."}] }
        const newValidationErrors = {};
        apiError.errors.forEach((valError) => {
          if (valError.param) {
            newValidationErrors[valError.param] = valError.msg;
          }
        });
        setValidationErrors(newValidationErrors);
        setError(
          apiError.message || 'Validation failed. Please check the form.'
        );
      } else {
        setError(
          apiError?.message || 'Failed to save skill. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && isEditMode)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {isEditMode ? 'Edit Skill' : 'Create New Skill'}
        </h1>
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage('')} // Allow manual closing
            className="mb-4"
          />
        )}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => clearMessages(false)}
            className="mb-4"
          />
        )}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <TextInput
            label="Skill Name"
            name="name"
            value={skill.name}
            onChange={handleChange}
            error={validationErrors.name}
            required
            placeholder="e.g., JavaScript, React, Node.js"
          />
          <div className="mb-4">
            <label
              htmlFor="proficiency"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Proficiency
            </label>
            <select
              name="proficiency"
              id="proficiency"
              value={skill.proficiency}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.proficiency
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            {validationErrors.proficiency && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.proficiency}
              </p>
            )}
          </div>
          <TextInput
            label="Category"
            name="category"
            value={skill.category}
            onChange={handleChange}
            error={validationErrors.category}
            required
            placeholder="e.g., Frontend, Backend, Database, DevOps"
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/skills')}
              disabled={submitting}
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
                  : 'Create Skill'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default SkillFormPage;
