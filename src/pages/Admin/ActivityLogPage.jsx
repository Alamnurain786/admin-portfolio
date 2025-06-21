import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Toast from '../../components/UI/Toast';
import Pagination from '../../components/UI/Pagination';
import { apiService } from '../../utils/api';
import {
  FaUserCircle,
  FaInfoCircle,
  FaCalendarAlt,
  FaFilter,
} from 'react-icons/fa';

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '', show: false });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, show: true });
  }, []);

  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: pagination.itemsPerPage,
          ...filters, // Spread active filters
        };
        // Remove empty filter values
        Object.keys(params).forEach((key) => {
          if (params[key] === '' || params[key] === null) {
            delete params[key];
          }
        });

        const response = await apiService.getActivityLogs(params);
        setLogs(response.data.data.logs || []);
        setPagination(
          response.data.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 20,
          }
        );
      } catch (err) {
        showToast(
          err.response?.data?.message || 'Failed to fetch activity logs.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.itemsPerPage, filters, showToast]
  );

  useEffect(() => {
    fetchLogs(pagination.currentPage);
  }, [fetchLogs, pagination.currentPage]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to page 1
    fetchLogs(1); // Fetch with new filters
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      action: '',
      entityType: '',
      startDate: '',
      endDate: '',
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    // fetchLogs(1) will be called by useEffect due to filters changing if fetchLogs depends on it directly
    // or call it explicitly if needed after state update
  };

  useEffect(() => {
    // Re-fetch if filters are cleared and fetchLogs is not triggered by state change
    if (Object.values(filters).every((val) => val === '')) {
      fetchLogs(1);
    }
  }, [filters, fetchLogs]);

  if (loading && logs.length === 0) {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Admin Activity Log
        </h1>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
        >
          <FaFilter className="mr-2" /> {showFilters ? 'Hide' : 'Show'} Filters
        </button>

        {showFilters && (
          <div className="p-4 mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                name="userId"
                placeholder="User ID"
                value={filters.userId}
                onChange={handleFilterChange}
                className="p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
              />
              <input
                type="text"
                name="action"
                placeholder="Action (e.g., User Login)"
                value={filters.action}
                onChange={handleFilterChange}
                className="p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
              />
              <input
                type="text"
                name="entityType"
                placeholder="Entity Type (e.g., Post)"
                value={filters.entityType}
                onChange={handleFilterChange}
                className="p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
              />
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
              />
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <LoadingSpinner />
          </div>
        )}

        {!loading && logs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              No activity logs found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <FaUserCircle className="mr-2 text-gray-500 dark:text-gray-400" />
                        {log.userId?.username || log.userId?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-200">
                      {log.action}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {log.entityType && <div>Type: {log.entityType}</div>}
                      {log.entityId && <div>ID: {log.entityId}</div>}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-1 text-xs">
                          {Object.entries(log.details).map(([key, value]) => (
                            <div key={key}>{`${key}: ${String(value).substring(
                              0,
                              50
                            )}${String(value).length > 50 ? '...' : ''}`}</div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {log.ipAddress || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pagination.totalPages > 1 && logs.length > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

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

export default ActivityLogPage;
