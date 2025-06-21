// src/pages/Blogs/BlogPostListPage.jsx
// This file is part of the admin-portfolio project to list and manage blog posts in the admin panel.
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { apiService } from '../../utils/api';
import AdminLayout from '../../components/Layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Alert from '../../components/UI/Alert';
import ConfirmationModal from '../../components/UI/ConfirmationModal';

const BlogPostListPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // For success feedback
  const { user } = useAuth();

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // Define fetchPostsData using useCallback for stable identity
  const fetchPostsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    // setSuccessMessage(null); // Clear success message on new fetch
    try {
      const response = await apiService.getPosts();
      let fetchedPosts = [];
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.posts)
      ) {
        fetchedPosts = response.data.data.posts;
      } else {
        fetchedPosts = [];
      }
      setPosts(fetchedPosts);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to fetch posts. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array: function created once

  useEffect(() => {
    fetchPostsData();
  }, [fetchPostsData]); // Call on mount and if fetchPostsData identity changes (it won't here)

  const handleDeleteInitiate = (postId, postTitle) => {
    setPostToDelete({ id: postId, title: postTitle });
    setShowDeleteConfirmModal(true);
    setError(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete?.id) return;

    if (!['admin', 'editor'].includes(user?.accessLevel)) {
      setError("You don't have permission to delete posts.");
      setShowDeleteConfirmModal(false);
      setPostToDelete(null);
      return;
    }

    try {
      // Optional: Set a specific deleting state if you want finer-grained loading indicators
      // setIsDeleting(true);
      await apiService.deletePost(postToDelete.id);
      setSuccessMessage(
        `Post "${postToDelete.title || 'this post'}" deleted successfully.`
      );

      // Option 1: Update UI by filtering locally (faster perceived performance)
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post._id !== postToDelete.id)
      );

      // Option 2: Refetch the entire list from the server (ensures data consistency if needed)
      // If you choose this, the "few seconds" delay will include this fetch time.
      // await fetchPostsData();

      // Note: The previous pagination logic was problematic as `currentPage` was not defined.
      // If pagination is implemented, you'd need to manage `currentPage` state
      // and potentially adjust it here if the current page becomes empty after deletion,
      // then call `fetchPostsData` with the new page.
    } catch (err) {
      // This error is now more likely to be from the deletePost API call itself
      setError(
        err.response?.data?.message ||
          'Failed to delete post. Please try again.'
      );
      // If you were doing an optimistic update that you needed to revert, you'd do it here.
      // Since we are filtering or refetching, a direct revert of `setPosts` might not be necessary
      // unless the filter itself was optimistic before the await.
    } finally {
      // setIsDeleting(false);
      setShowDeleteConfirmModal(false);
      setPostToDelete(null);
    }
  };

  const postsArray = Array.isArray(posts) ? posts : [];

  // Show loading spinner only on initial load or when fetchPostsData explicitly sets it
  if (loading && postsArray.length === 0 && !error && !successMessage) {
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
            Blog Posts
          </h1>
          {user?.accessLevel === 'admin' && (
            <Link
              to="/admin/posts/new"
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 w-full sm:w-auto justify-center"
            >
              <FaPlus className="mr-2" /> New Post
            </Link>
          )}
        </div>

        {/* Display Success and Error Messages */}
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage(null)} // Assuming Alert can be closable
            className="mb-4"
          />
        )}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)} // Assuming Alert can be closable
            className="mb-4"
          />
        )}

        {loading &&
          postsArray.length > 0 && ( // Show a subtle loading indicator if reloading list
            <div className="text-center py-4">
              <LoadingSpinner size="small" /> Refreshing posts...
            </div>
          )}

        {!loading && postsArray.length === 0 && !error ? (
          // ... (rest of your no posts found JSX)
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-gray-600 dark:text-gray-300">
              No blog posts found.
            </p>
            {user?.accessLevel === 'admin' && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-400">
                  Admin Information
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  If you're seeing this message and expecting posts, please
                  check:
                </p>
                <ul className="list-disc pl-5 mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <li>
                    The API endpoint is correctly configured (`/api/posts`)
                  </li>
                  <li>The backend server is running and accessible</li>
                  <li>
                    Posts exist in the database and are marked as 'published'
                    (for public view) or the correct access level is set up for
                    admin view.
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          !loading &&
          postsArray.length > 0 && ( // Ensure not loading and posts exist before rendering table
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Headline
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                      Permalink
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                      Published
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-50 dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {postsArray.map((post, index) => (
                    <tr
                      key={post._id || index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">
                        {post.headline || post.title || 'Untitled'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell">
                        {post.permalink || post.slug || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            post.metadata?.visibility === 'published'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {post.metadata?.visibility ||
                            post.visibility ||
                            post.status ||
                            'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 hidden lg:table-cell">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium">
                        {/* Ensure user and accessLevel check is robust */}
                        {(user?.accessLevel === 'admin' ||
                          user?.accessLevel === 'editor') && (
                          <div className="flex justify-end space-x-2">
                            <Link
                              to={`/admin/posts/edit/${post._id}`}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit Post"
                            >
                              <FaEdit className="text-lg" />
                            </Link>
                            <button
                              onClick={() =>
                                handleDeleteInitiate(
                                  post._id,
                                  post.headline || post.title
                                )
                              } // Pass title for confirmation message
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete Post"
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
        isOpen={showDeleteConfirmModal}
        onClose={() => {
          setShowDeleteConfirmModal(false);
          setPostToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Blog Post"
        message={`Are you sure you want to delete the post "${
          postToDelete?.title || 'this post'
        }"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </AdminLayout>
  );
};

export default BlogPostListPage;
