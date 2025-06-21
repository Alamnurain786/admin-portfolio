// src/pages/Blogs/BlogPostFormPage.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../../utils/api';
import { debounce } from 'lodash';
import slugify from 'slugify';
import AdminLayout from '../../components/Layout/AdminLayout';
import Alert from '../../components/UI/Alert';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/UI/Toast';

// Import the new components
import BlogPostForm from '../../components/Blogs/BlogPostForm';
import BlogPostPreview from '../../components/Blogs/BlogPostPreview';

const BlogPostFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const isEditMode = Boolean(id);

  // Initial post state
  const initialPostState = {
    headline: '',
    permalink: '',
    excerpt: '',
    articleBody: '',
    topics: [],
    heroImage: '',
    imagePublicId: '',
    imageAlt: '',
    metadata: {
      visibility: 'draft',
    },
  };

  const [post, setPost] = useState(initialPostState);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [permalinkEdited, setPermalinkEdited] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // State for toast notification
  const [toast, setToast] = useState({ message: '', type: '', show: false });

  // --- NEW STATE --- to remember a successful upload across failed submissions
  const [uploadedImageData, setUploadedImageData] = useState({
    imageUrl: null,
    publicId: null,
  });

  const initialImagePublicId = useRef(null);
  const abortControllerRef = useRef(null);

  // Function to show toast
  const showToast = useCallback(
    (message, type = 'success', duration = 3000) => {
      setToast({ message, type, show: true });
      // If you want it to disappear automatically, the Toast component handles it,
      // but you can also explicitly hide it here if needed for specific logic.
      setTimeout(
        () => setToast({ message: '', type: '', show: false }),
        duration
      );
    },
    []
  );

  // Memoized SEO score calculation
  const seoScore = useMemo(() => {
    let score = 0;
    const { headline, excerpt, articleBody } = post;
    const hasImage = !!imagePreview;

    // Headline length (0-15 points)
    if (headline.length >= 40 && headline.length <= 70) score += 15;
    else if (headline.length >= 30) score += 10;
    else if (headline.length >= 20) score += 5;

    // Excerpt length (0-15 points)
    if (excerpt.length >= 140 && excerpt.length <= 160) score += 15;
    else if (excerpt.length >= 100) score += 10;
    else if (excerpt.length >= 50) score += 5;

    // Image presence and alt text (0-20 points)
    if (hasImage) score += 15;
    if (post.imageAlt && post.imageAlt.length >= 10) score += 5;

    // Article body length (0-20 points)
    if (articleBody.length >= 1500) score += 20;
    else if (articleBody.length >= 800) score += 15;
    else if (articleBody.length >= 300) score += 10;
    else if (articleBody.length >= 100) score += 5;

    // Topics count (0-10 points)
    if (post.topics.length >= 3) score += 10;
    else if (post.topics.length >= 1) score += 5;

    // Permalink optimization (0-5 points)
    if (
      post.permalink &&
      post.permalink.length <= 60 &&
      post.permalink.length >= 10
    ) {
      score += 5;
    }

    return Math.min(score, 100); // Cap at 100
  }, [
    post.headline,
    post.excerpt,
    post.articleBody,
    post.topics,
    post.imageAlt,
    post.permalink,
    post.imagePreview,
  ]);

  // Fetch post data for edit mode
  useEffect(() => {
    const fetchPost = async () => {
      if (!isEditMode) return;

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setGeneralError('');

        const response = await apiService.getPost(id, {
          signal: abortControllerRef.current.signal,
        });

        const postData = response.data?.data;

        if (!postData) {
          throw new Error('Post data not found');
        }

        setPost({
          headline: postData.headline || '',
          permalink: postData.permalink || '',
          excerpt: postData.excerpt || '',
          articleBody: postData.articleBody || '',
          topics: Array.isArray(postData.topics) ? postData.topics : [],
          heroImage: postData.heroImage || '',
          imagePublicId: postData.imagePublicId || '',
          imageAlt: postData.imageAlt || '',
          metadata: {
            visibility: postData.metadata?.visibility || 'draft',
          },
        });

        if (postData.heroImage) {
          setImagePreview(postData.heroImage);
          initialImagePublicId.current = postData.imagePublicId || null;
        }

        setPermalinkEdited(Boolean(postData.permalink));
      } catch (err) {
        if (err.name === 'AbortError') return; // Request was cancelled

        console.error('Failed to fetch post:', err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to load post data. Please try again.';
        setGeneralError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id, isEditMode]);

  // Auto-generate permalink from headline
  useEffect(() => {
    if (!permalinkEdited && post.headline) {
      const slug = slugify(post.headline, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });
      setPost((prev) => ({ ...prev, permalink: slug }));
    }
  }, [post.headline, permalinkEdited]);

  // Auto-save functionality with debouncing
  const autoSave = useCallback(
    debounce(async (postData) => {
      if (!isEditMode || !id || isSubmitting) return;

      try {
        await apiService.updatePost(id, postData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Auto-save failed:', err);
        // Don't show error to user for auto-save failures
      }
    }, 3000),
    [id, isEditMode, isSubmitting]
  );

  // Trigger auto-save when post data changes
  useEffect(() => {
    if (isEditMode && id && post.headline) {
      autoSave(post);
    }

    return () => {
      autoSave.cancel();
    };
  }, [post, autoSave, isEditMode, id]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Clear validation error when field changes
  const clearFieldError = useCallback((fieldName) => {
    setValidationErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  }, []);

  // Handle form field changes
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      clearFieldError(name);

      if (name === 'visibility') {
        setPost((prev) => ({
          ...prev,
          metadata: {
            ...prev.metadata,
            visibility: value,
          },
        }));
      } else {
        setPost((prev) => ({ ...prev, [name]: value }));
      }

      if (name === 'permalink') {
        setPermalinkEdited(true);
      }
    },
    [clearFieldError]
  );

  // Handle topic addition
  const handleTopicAdd = useCallback(
    (topic) => {
      if (!topic || typeof topic !== 'string') return;

      const trimmedTopic = topic.trim();
      if (!trimmedTopic) return;

      setPost((prev) => {
        // Prevent duplicate topics
        if (prev.topics.includes(trimmedTopic)) return prev;
        return {
          ...prev,
          topics: [...prev.topics, trimmedTopic],
        };
      });

      clearFieldError('topics');
    },
    [clearFieldError]
  );

  // Handle topic removal
  const handleTopicRemove = useCallback((topicToRemove) => {
    setPost((prev) => ({
      ...prev,
      topics: prev.topics.filter((topic) => topic !== topicToRemove),
    }));
  }, []);

  // Handle image selection with validation
  const handleImageSelection = useCallback(
    (e) => {
      const file = e.target.files?.[0];

      if (!file) {
        setSelectedFile(null);
        setImagePreview('');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ];
      if (!allowedTypes.includes(file.type)) {
        setGeneralError(
          'Please select a valid image file (JPEG, PNG, WebP, or GIF)'
        );
        showToast(
          'Invalid image file type. Please use JPEG, PNG, WebP, or GIF.',
          'error'
        );
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setGeneralError('Image file must be smaller than 5MB');
        showToast('Image file must be smaller than 5MB.', 'error');
        return;
      }

      // Clean up previous blob URL
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }

      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadProgress(0);
      clearFieldError('heroImage');
    },
    [imagePreview, clearFieldError, showToast]
  );

  // Handle image removal
  const handleRemoveImage = useCallback(() => {
    // Clean up blob URL
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedFile(null);
    setImagePreview('');
    setUploadedImageData({ imageUrl: null, publicId: null });
    setPost((prev) => ({
      ...prev,
      heroImage: '',
      imagePublicId: '',
      imageAlt: '',
    }));
  }, [imagePreview]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error states and toast
    setValidationErrors({});
    setGeneralError('');
    setToast({ message: '', type: '', show: false });

    // Client-side validation
    const errors = {};

    if (!post.headline.trim()) {
      errors.headline = 'Headline is required';
    } else if (post.headline.length < 10) {
      errors.headline = 'Headline must be at least 10 characters';
    } else if (post.headline.length > 100) {
      errors.headline = 'Headline must be less than 100 characters';
    }

    if (!post.permalink.trim()) {
      errors.permalink = 'Permalink is required';
    } else if (!/^[a-z0-9-]+$/.test(post.permalink)) {
      errors.permalink =
        'Permalink can only contain lowercase letters, numbers, and hyphens';
    }

    if (!post.excerpt.trim()) {
      errors.excerpt = 'Excerpt is required';
    } else if (post.excerpt.length < 50) {
      errors.excerpt = 'Excerpt must be at least 50 characters';
    } else if (post.excerpt.length > 500) {
      errors.excerpt = 'Excerpt must be less than 500 characters';
    }

    if (!post.articleBody.trim()) {
      errors.articleBody = 'Article body is required';
    } else if (post.articleBody.length < 100) {
      errors.articleBody = 'Article body must be at least 100 characters';
    }

    if (post.topics.length === 0) {
      errors.topics = 'At least one topic is required';
    } else if (post.topics.length > 10) {
      errors.topics = 'Maximum 10 topics allowed';
    }

    if (imagePreview && !post.imageAlt.trim()) {
      errors.imageAlt = 'Alt text is required when image is present';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setGeneralError('Please correct the highlighted fields to continue.');
      showToast('Validation failed. Please check the form.', 'error');
      return;
    }

    if (!token) {
      setGeneralError('Authentication required to create or edit posts');
      showToast('Authentication required. Please log in.', 'error');
      return;
    }
    // Set submitting state
    setIsSubmitting(true);

    try {
      let finalHeroImageUrl = post.heroImage;
      let finalImagePublicId = post.imagePublicId;

      // Handle image upload
      if (selectedFile && !uploadedImageData.imageUrl) {
        try {
          // Delete old image from Cloudinary if we are in edit mode and replacing an image
          if (isEditMode && initialImagePublicId.current) {
            await apiService.deleteImage(initialImagePublicId.current);
          }

          const formData = new FormData();
          formData.append('image', selectedFile);
          const uploadResponse = await apiService.uploadImage(formData, {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            },
          });

          if (
            uploadResponse?.data?.success &&
            uploadResponse?.data?.data.imageUrl
          ) {
            const { imageUrl, publicId } = uploadResponse.data.data;
            // Remember the successful upload data in state
            setUploadedImageData({ imageUrl, publicId });
            // Use this data for the current submission attempt
            finalHeroImageUrl = imageUrl;
            finalImagePublicId = publicId;
          } else {
            throw new Error(
              'Image upload failed - invalid response from server.'
            );
          }
        } catch (uploadError) {
          // If the upload itself fails, stop the entire submission process.
          showToast(uploadError.message, 'error');
          setIsSubmitting(false);
          return; // Exit handleSubmit
        }
      } else if (uploadedImageData.imageUrl) {
        // A file was already uploaded in a previous failed attempt, so we reuse the data.
        finalHeroImageUrl = uploadedImageData.imageUrl;
        finalImagePublicId = uploadedImageData.publicId;
      } else if (!imagePreview && initialImagePublicId.current) {
        // Handle case where an existing image was removed
        await apiService.deleteImage(initialImagePublicId.current);
        finalHeroImageUrl = '';
        finalImagePublicId = '';
      }

      // Prepare post payload
      const postPayload = {
        headline: post.headline.trim(),
        permalink: post.permalink.trim(),
        excerpt: post.excerpt.trim(),
        articleBody: post.articleBody.trim(),
        topics: post.topics.filter((topic) => topic.trim()),
        heroImage: finalHeroImageUrl,
        imagePublicId: finalImagePublicId,
        imageAlt: post.imageAlt.trim(),
        visibility: post.metadata.visibility,
      };

      let successMessage = '';
      if (isEditMode) {
        await apiService.updatePost(id, postPayload);
        successMessage = 'Post updated successfully!';
      } else {
        await apiService.createPost(postPayload);
        successMessage = 'Post created successfully!';
      }

      // Show success toast
      showToast(successMessage, 'success');

      // Navigate after a short delay to allow toast to be seen
      setTimeout(() => {
        navigate('/admin/posts', {
          state: { message: successMessage }, // Still pass for cases where you might read it on the next page
        });
      }, 500); // Adjust delay as needed
    } catch (err) {
      console.error('Failed to save post:', err);

      const responseData = err.response?.data;
      let errorMessage = 'Failed to save post. An unexpected error occurred.';

      // Handle structured validation errors from backend
      if (
        responseData?.success === false &&
        responseData?.data?.errors &&
        Array.isArray(responseData.data.errors)
      ) {
        const serverErrors = responseData.data.errors;
        const newValidationErrors = {};

        serverErrors.forEach((error) => {
          if (error.field && error.message) {
            newValidationErrors[error.field] = error.message;
          }
        });

        setValidationErrors(newValidationErrors);
        errorMessage =
          responseData.message ||
          'Validation failed. Please check your form inputs.';
      } else if (responseData?.data?.error) {
        // Catch string errors passed under 'data.error'
        errorMessage = responseData.data.error;
      } else if (responseData?.message) {
        // General message from backend
        errorMessage = responseData.message;
      } else if (typeof responseData === 'string') {
        // Plain string error response
        errorMessage = responseData;
      } else if (err.message) {
        // Axios/JS error message
        errorMessage = err.message;
      }

      setGeneralError(errorMessage);
      showToast(errorMessage, 'error'); // Show error toast for any failure
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </AdminLayout>
    );
  }

  // Permission check
  if (user?.accessLevel !== 'admin') {
    return (
      <AdminLayout>
        <Alert
          type="error"
          message="You do not have permission to access this page."
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Post' : 'Create New Post'}
            </h1>
            {isEditMode && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Post ID: {id}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* SEO Score */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                SEO Score:
              </span>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  seoScore >= 80
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : seoScore >= 60
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                {seoScore}/100
              </div>
            </div>

            {/* Auto-save indicator */}
            {isEditMode && isSaved && (
              <span className="text-green-600 dark:text-green-400 text-sm flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Auto-saved
              </span>
            )}

            {/* Action buttons */}
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPreview(!showPreview)}
              disabled={isSubmitting}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/posts')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Error alerts */}
        {generalError && (
          <Alert
            type="error"
            message={generalError}
            onClose={() => setGeneralError('')}
            className="mb-6"
          />
        )}

        {Object.keys(validationErrors).length > 0 && !generalError && (
          <Alert
            type="error"
            message="Please correct the highlighted fields to continue."
            className="mb-6"
          />
        )}

        {/* Main content */}
        {showPreview ? (
          <BlogPostPreview
            post={post}
            imagePreview={imagePreview}
            seoScore={seoScore}
          />
        ) : (
          <BlogPostForm
            post={post}
            handleChange={handleChange}
            handleTopicAdd={handleTopicAdd}
            handleTopicRemove={handleTopicRemove}
            handleImageSelection={handleImageSelection}
            handleRemoveImage={handleRemoveImage}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            uploadProgress={uploadProgress}
            imagePreview={imagePreview}
            seoScore={seoScore}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
          />
        )}
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

export default BlogPostFormPage;
