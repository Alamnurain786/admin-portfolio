import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import TextInput from '../../components/UI/TextInput';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { apiService } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const ProjectsFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth(); // Keep if apiService methods need it explicitly
  const isEditMode = Boolean(id);

  const initialProjectState = {
    title: '',
    description: '',
    category: '',
    status: 'In Progress',
    tools: '', // Stored as comma-separated string in state
    link: '',
    // Add other fields like 'liveLink' if your backend supports it
  };

  const [project, setProject] = useState(initialProjectState);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
      clearMessages(); // Clear all messages when starting to load
      apiService
        .getProjectById(id)
        .then((response) => {
          const fetchedProject = response?.data?.data || response?.data;

          if (fetchedProject) {
            setProject({
              title: fetchedProject.title || '',
              description: fetchedProject.description || '',
              category: fetchedProject.category || '',
              status: fetchedProject.status || 'In Progress',
              tools: Array.isArray(
                fetchedProject.technologies || fetchedProject.tools // Prefer 'technologies' if backend uses that
              )
                ? (fetchedProject.technologies || fetchedProject.tools).join(
                    ', '
                  )
                : typeof (
                      fetchedProject.technologies || fetchedProject.tools
                    ) === 'string'
                  ? fetchedProject.technologies || fetchedProject.tools
                  : '',
              link: fetchedProject.repoLink || fetchedProject.link || '', // Prefer 'repoLink' if backend uses that
              // liveLink: fetchedProject.liveLink || "", // If you have a live link
            });
          } else {
            setError('Project data not found.');
            setProject(initialProjectState); // Reset form if not found
          }
        })
        .catch((err) => {
          console.error('Failed to load project:', err);
          setError(
            err.response?.data?.message ||
              'Failed to load project details. Please try again.'
          );
          setProject(initialProjectState); // Reset form on error
        })
        .finally(() => setLoading(false));
    } else {
      setProject(initialProjectState);
      clearMessages(); // Clear messages for create mode
    }
  }, [id, isEditMode, clearMessages]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    clearMessages(false); // Clear errors, but not success message
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages(true); // Clear all messages before new submission

    let localErrors = {};
    if (!project.title.trim()) localErrors.title = 'Title is required.';
    if (!project.description.trim())
      localErrors.description = 'Description is required.';
    if (!project.link.trim())
      localErrors.link = 'Project repository link is required.';
    if (project.link.trim() && !/^https?:\/\/\S+$/.test(project.link.trim())) {
      localErrors.link = 'Please enter a valid URL for the project link.';
    }
    // Add validation for project.category if it's required
    // if (!project.category.trim()) localErrors.category = "Category is required.";

    if (Object.keys(localErrors).length > 0) {
      setValidationErrors(localErrors);
      setError('Please correct the highlighted errors.');
      return;
    }

    setSubmitting(true);
    try {
      // Backend might expect 'technologies' and 'repoLink'
      const projectDataToSubmit = {
        title: project.title,
        description: project.description,
        category: project.category,
        status: project.status,
        tools: project.tools // Assuming backend expects 'technologies'
          .split(',')
          .map((tool) => tool.trim())
          .filter(Boolean),
        link: project.link, // Assuming backend expects 'repoLink'
        // liveLink: project.liveLink, // If you have a live link
      };

      let response;
      if (isEditMode) {
        response = await apiService.updateProject(id, projectDataToSubmit);
      } else {
        response = await apiService.createProject(projectDataToSubmit);
      }

      setSuccessMessage(
        response.data?.message ||
          `Project ${isEditMode ? 'updated' : 'created'} successfully!`
      );

      setTimeout(() => {
        navigate('/admin/projects');
      }, 1500);
    } catch (err) {
      console.error('Failed to save project:', err);
      const apiError = err.response?.data;

      if (
        apiError &&
        Array.isArray(apiError.data) &&
        apiError.message === 'Validation failed'
      ) {
        const newValidationErrors = {};
        apiError.data.forEach((valError) => {
          if (valError.path) {
            // Check for 'path'
            newValidationErrors[valError.path] = valError.msg;
          }
        });
        setValidationErrors(newValidationErrors);
        setError(
          apiError.message || 'Validation failed. Please check the form.'
        );
      } else if (apiError?.errors && Array.isArray(apiError.errors)) {
        const newValidationErrors = {};
        apiError.errors.forEach((valError) => {
          if (valError.param) {
            // Check for 'param'
            newValidationErrors[valError.param] = valError.msg;
          }
        });
        setValidationErrors(newValidationErrors);
        setError(
          apiError.message || 'Validation failed. Please check the form.'
        );
      } else {
        setError(
          apiError?.message ||
            'An unexpected error occurred. Failed to save project.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && isEditMode) {
    // Show loading only when fetching for edit mode
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
          {isEditMode ? 'Edit Project' : 'Create New Project'}
        </h1>

        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage('')} // Only clear success message
            className="mb-4"
          />
        )}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => clearMessages(false)} // Clear error and validation, keep success
            className="mb-4"
          />
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6"
        >
          <TextInput
            label="Project Title"
            name="title"
            value={project.title}
            onChange={handleChange}
            error={validationErrors.title}
            required
            placeholder="e.g., HR Dashboard in Power BI"
          />
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="5"
              value={project.description}
              onChange={handleChange}
              required
              placeholder="Built an interactive HR dashboard to visualize employee data and KPIs."
              className={`w-full p-2 border ${
                validationErrors.description
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500`}
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.description}
              </p>
            )}
          </div>

          <TextInput
            label="Category"
            name="category"
            value={project.category}
            onChange={handleChange}
            error={validationErrors.category}
            placeholder="e.g., Web Development, Data Analysis, General"
            // required // Add if category is mandatory
          />

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={project.status}
              onChange={handleChange}
              className={`w-full p-2 border ${
                validationErrors.status
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
            {validationErrors.status && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.status}
              </p>
            )}
          </div>

          <TextInput
            label="Tools/Technologies Used (comma separated)"
            name="tools" // Frontend state uses 'tools'
            value={project.tools}
            onChange={handleChange}
            error={validationErrors.tools} // Error key should match 'tools'
            placeholder="e.g., Power BI, Excel, SQL, React, Node.js"
          />
          <TextInput
            label="Project Repository Link (URL)" // Changed label for clarity
            name="link" // Frontend state uses 'link'
            type="url"
            value={project.link}
            onChange={handleChange}
            error={validationErrors.link} // Error key should match 'link'
            required
            placeholder="https://github.com/yourusername/hr-dashboard"
          />
          {/* You can add another TextInput for a 'liveLink' if needed */}
          {/*
          <TextInput
            label="Live Project Link (URL, Optional)"
            name="liveLink"
            type="url"
            value={project.liveLink || ""}
            onChange={handleChange}
            error={validationErrors.liveLink}
            placeholder="https://yourproject.live"
          />
          */}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/projects')}
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
                  : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProjectsFormPage;
