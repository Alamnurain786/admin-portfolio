import React, { useState, useEffect, useCallback } from 'react';
import { FaTrash, FaEnvelopeOpen, FaEnvelope } from 'react-icons/fa'; // FaEye was unused
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Toast from '../../components/UI/Toast';
import ConfirmationModal from '../../components/UI/ConfirmationModal';
import Pagination from '../../components/UI/Pagination';
import { apiService } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const ContactMessagesPage = () => {
  // --- Component State ---
  const [messages, setMessages] = useState([]); // Stores the fetched contact messages
  const [loading, setLoading] = useState(true); // Manages loading state for API calls
  const [toast, setToast] = useState({ message: '', type: '', show: false }); // Manages toast notifications
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Controls visibility of the delete confirmation modal
  const [messageToDelete, setMessageToDelete] = useState(null); // Stores the message object to be deleted
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10, // Default items per page
  });
  const [filter, setFilter] = useState('all'); // Current filter for messages (all, read, unread)
  const [sortOrder, setSortOrder] = useState('desc'); // Current sort order for messages (desc, asc)

  // --- Hooks ---
  const { user: loggedInUser } = useAuth(); // Access logged-in user data from AuthContext
  const { itemsPerPage } = pagination; // Destructure for stable dependency in useCallback

  // --- Helper Functions ---

  /**
   * Displays a toast notification.
   * @param {string} message - The message to display.
   * @param {string} type - The type of toast (e.g., "success", "error").
   */
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, show: true });
  }, []);

  // --- API Interaction Callbacks ---

  /**
   * Fetches contact messages from the API based on current pagination, filter, and sort settings.
   * @param {number} page - The page number to fetch.
   */
  const fetchMessages = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: itemsPerPage,
          sort: sortOrder,
        };
        if (filter !== 'all') {
          params.isRead = filter === 'read';
        }

        const response = await apiService.getContactMessages(params);

        let messagesData = [];
        let paginationData = {
          // Default pagination structure
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: itemsPerPage,
        };

        // Extract data from API response, handling different possible structures
        if (response && response.data) {
          if (response.data.data && typeof response.data.data === 'object') {
            // Handles responses where data is nested under response.data.data
            messagesData = response.data.data.messages || [];
            paginationData = response.data.data.pagination || paginationData;
          } else if (response.data.messages) {
            // Handles responses where data is directly under response.data
            messagesData = response.data.messages || [];
            paginationData = response.data.pagination || paginationData;
          } else {
            // Fallback if structure is unexpected
            messagesData = [];
            paginationData.totalItems = 0;
            paginationData.totalPages = 1;
          }
        }

        if (!Array.isArray(messagesData)) {
          messagesData = []; // Ensure messagesData is always an array
        }

        setMessages(messagesData);
        setPagination(paginationData);
      } catch (err) {
        showToast(
          err.response?.data?.message || 'Failed to fetch messages.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    },
    [showToast, itemsPerPage, filter, sortOrder] // Dependencies for useCallback
  );

  /**
   * Initiates the message deletion process by showing a confirmation modal.
   * @param {object} message - The message object to delete.
   */
  const handleDeleteInitiate = (message) => {
    setMessageToDelete(message);
    setShowDeleteModal(true);
  };

  /**
   * Confirms and executes the deletion of a message.
   * Refetches messages on success.
   */
  const handleDeleteConfirm = async () => {
    if (!messageToDelete?._id) return;
    try {
      await apiService.deleteContactMessage(messageToDelete._id);
      showToast('Message deleted successfully!', 'success');
      // Refetch messages, staying on the current page if possible,
      // or going to previous page if current page becomes empty.
      const newTotalItems = pagination.totalItems - 1;
      const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
      let pageToFetch = pagination.currentPage;
      if (pagination.currentPage > newTotalPages && newTotalPages > 0) {
        pageToFetch = newTotalPages;
      } else if (newTotalItems === 0) {
        pageToFetch = 1; // Go to first page if no items left
      }
      fetchMessages(pageToFetch);
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to delete message.',
        'error'
      );
    } finally {
      setShowDeleteModal(false);
      setMessageToDelete(null);
    }
  };

  /**
   * Toggles the read/unread status of a message.
   * Updates the local message state and shows a toast notification.
   * @param {string} messageId - The ID of the message to update.
   * @param {boolean} currentStatus - The current read status of the message.
   */
  const handleToggleReadStatus = async (messageId, currentStatus) => {
    try {
      await apiService.toggleContactMessageReadStatus(messageId);
      showToast(
        `Message marked as ${currentStatus ? 'unread' : 'read'}.`,
        'success'
      );
      // Update local state immediately for better UX
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, isRead: !msg.isRead } : msg
        )
      );
      // Optionally, if you have a global unread count, trigger its refetch here
      // e.g., refetchUnreadCount();
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to update message status.',
        'error'
      );
    }
  };

  // --- Event Handlers ---

  /**
   * Handles page changes from the Pagination component.
   * @param {number} newPage - The new page number.
   */
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  /**
   * Handles changes to the message filter (all, read, unread).
   * Resets to the first page and triggers a refetch.
   * @param {object} e - The event object from the select input.
   */
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to page 1 on filter change
  };

  /**
   * Handles changes to the message sort order.
   * Resets to the first page and triggers a refetch.
   * @param {object} e - The event object from the select input.
   */
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to page 1 on sort change
  };

  // --- Effects ---

  /**
   * Main effect to fetch messages when the component mounts or dependencies change.
   * Only fetches if the user is an admin.
   */
  useEffect(() => {
    if (loggedInUser?.accessLevel === 'admin') {
      fetchMessages(pagination.currentPage);
    } else if (loggedInUser) {
      // If user is logged in but not admin
      setLoading(false);
      showToast('You do not have permission to view this page.', 'error');
    }
    // If loggedInUser is null (still loading auth state), loading remains true
    // and the loading spinner will show.
  }, [fetchMessages, pagination.currentPage, loggedInUser, showToast]); // Added showToast as it's used in this effect's path

  // --- Render Logic ---

  // Initial loading state (before any messages or pagination info is available)
  if (
    loading &&
    messages.length === 0 &&
    pagination.totalItems === 0 &&
    loggedInUser?.accessLevel === 'admin'
  ) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </AdminLayout>
    );
  }

  if (loggedInUser && loggedInUser.accessLevel !== 'admin') {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-500">
            Access Denied. You must be an admin to view this page.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Contact Messages
        </h1>

        {/* Filters and Sorting Controls */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center">
          <div>
            <label htmlFor="filterStatus" className="mr-2 dark:text-gray-300">
              Filter by:
            </label>
            <select
              id="filterStatus"
              value={filter}
              onChange={handleFilterChange}
              className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          <div>
            <label htmlFor="sortOrder" className="mr-2 dark:text-gray-300">
              Sort by Date:
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={handleSortChange}
              className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Inline loader for subsequent loads/filtering */}
        {loading && (messages.length > 0 || pagination.totalItems > 0) && (
          <div className="text-center py-4">
            <LoadingSpinner />
          </div>
        )}

        {/* No Messages Found State */}
        {!loading && messages.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              No messages found matching your criteria.
            </p>
          </div>
        ) : (
          !loading &&
          messages.length > 0 && (
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                      Received
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      View
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {messages.map((msg) => (
                    <tr
                      key={msg._id}
                      className={`${
                        msg.isRead
                          ? 'bg-gray-50 dark:bg-gray-800'
                          : 'bg-white dark:bg-gray-700 font-semibold dark:font-normal'
                      } hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors`}
                    >
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {msg.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell">
                        {msg.email}
                      </td>
                      <td
                        className="px-4 py-4 text-sm text-gray-700 dark:text-gray-200 truncate max-w-xs"
                        title={msg.subject || 'No Subject'}
                      >
                        {msg.subject || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell">
                        {new Date(msg.createdAt).toLocaleDateString()}{' '}
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            msg.isRead
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}
                        >
                          {msg.isRead ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() =>
                              handleToggleReadStatus(msg._id, msg.isRead)
                            }
                            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title={
                              msg.isRead ? 'Mark as Unread' : 'Mark as Read'
                            }
                          >
                            {msg.isRead ? (
                              <FaEnvelopeOpen className="text-lg text-gray-600 dark:text-gray-400" />
                            ) : (
                              <FaEnvelope className="text-lg text-blue-600 dark:text-blue-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteInitiate(msg)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Delete Message"
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Link to={`/admin/messages/${msg._id}`}>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs">
                            View Full Message
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Pagination Controls */}
        {!loading && pagination.totalPages > 1 && messages.length > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modals and Toast Notifications */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Message Deletion"
        message={`Are you sure you want to delete the message from "${
          messageToDelete?.name || 'this user'
        }"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
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

export default ContactMessagesPage;
