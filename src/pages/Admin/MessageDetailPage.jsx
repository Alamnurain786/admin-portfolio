import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Toast from '../../components/UI/Toast';
import { apiService } from '../../utils/api';

const MessageDetailPage = () => {
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '', show: false });

  // Toast handler
  const showToast = useCallback((message, type = 'error', duration = 3000) => {
    setToast({ message, type, show: true });
    setTimeout(
      () => setToast({ message: '', type: '', show: false }),
      duration
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    apiService
      .getContactMessageById(id)
      .then((res) => {
        // Support both {data: {data: {}}} and {data: {}}
        const msg =
          res?.data?.data && typeof res.data.data === 'object'
            ? res.data.data
            : res?.data || null;
        setMessage(msg);
      })
      .catch((err) => {
        showToast(
          err.response?.data?.message || 'Failed to fetch message.',
          'error'
        );
        setMessage(null);
      })
      .finally(() => setLoading(false));
  }, [id, showToast]);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="large" />
            </div>
          ) : !message ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
              <span className="text-lg text-red-600 dark:text-red-400">
                Message not found.
              </span>
              <div className="mt-6">
                <Link
                  to="/admin/messages"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Back to Messages
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                Contact Message Details
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">
                    Name:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 break-all">
                    {message.name}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">
                    Email:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 break-all">
                    {message.email}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">
                    Subject:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 break-all">
                    {message.subject || '-'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">
                    Message:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 whitespace-pre-line break-words">
                    {message.message}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">
                    IP Address:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 break-all">
                    {message.ipAddress}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">
                    User Agent:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 break-all">
                    {message.userAgent}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">
                    Created At:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">
                    Read:
                  </span>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      message.isRead
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}
                  >
                    {message.isRead ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <Link
                  to="/admin/messages"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Back to Messages
                </Link>
              </div>
            </div>
          )}
        </div>
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

export default MessageDetailPage;
