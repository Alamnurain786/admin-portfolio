import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../utils/api';

/**
 * Custom hook to fetch and manage the count of unread contact messages.
 * It periodically refreshes the count and provides a manual refetch function.
 *
 * @param {number} [refreshInterval=30000] - The interval in milliseconds to auto-refresh the count. Defaults to 30 seconds.
 * @returns {object} An object containing:
 *  - `unreadCount` (number): The number of unread messages.
 *  - `loading` (boolean): True if the count is currently being fetched.
 *  - `refetch` (function): A function to manually trigger a refetch of the unread count.
 */
export const useUnreadMessages = (refreshInterval = 30000) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  /**
   * Fetches the count of unread messages from the API.
   * Uses a limit of 1 as only the totalItems from pagination is needed.
   */
  const fetchUnreadCount = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getContactMessages({
        isRead: false,
        limit: 1, // We only need the count (totalItems) from pagination, not all messages
      });
      // Assuming the API response structure is { data: { pagination: { totalItems: X } } }
      // or { data: { data: { pagination: { totalItems: X } } } }
      const count =
        response.data?.data?.pagination?.totalItems || // Handles nested data object
        response.data?.pagination?.totalItems || // Handles direct pagination object
        0;
      setUnreadCount(count);
    } catch (error) {
      // In a production app, you might want to log this error to a monitoring service
      // console.error("Failed to fetch unread message count:", error);
      setUnreadCount(0); // Reset to 0 on error to avoid stale counts
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch the count immediately when the hook is first used
    fetchUnreadCount();

    // Set up an interval to periodically refresh the count
    const intervalId = setInterval(fetchUnreadCount, refreshInterval);

    // Cleanup function to clear the interval when the component unmounts
    // or when refreshInterval or fetchUnreadCount changes (though fetchUnreadCount is stable due to useCallback)
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchUnreadCount, refreshInterval]);

  return { unreadCount, loading, refetch: fetchUnreadCount };
};
