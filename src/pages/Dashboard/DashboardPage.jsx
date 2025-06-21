// src/pages/Dashboard/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Alert from '../../components/UI/Alert';
import { apiService } from '../../utils/api'; // Import apiService for making API calls
import { FaBlog, FaUsers, FaChartBar, FaClock } from 'react-icons/fa'; // Import icons for StatCards and Recent Activity

// Import your new components
import StatCard from '../../components/Dashboard/StatCard'; // Adjust path if needed
import PostsChart from '../../components/Dashboard/PostsChart'; // Adjust path if needed

const DashboardPage = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    postsChartData: [], // New state for chart data
  });
  const [showLoginSuccessAlert, setShowLoginSuccessAlert] = useState(false);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    if (location.state?.loginSuccess) {
      setShowLoginSuccessAlert(true);
      setLoginSuccessMessage(
        location.state.message || "You've successfully logged in!"
      );
      const timer = setTimeout(() => {
        setShowLoginSuccessAlert(false);
        setLoginSuccessMessage('');
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Helper to generate dummy data for the chart
  const generateMonthlyPostsData = () => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const today = new Date();
    const data = [];
    // Go back 6 months from the current month
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      data.push({
        month: monthName,
        count: Math.floor(Math.random() * 20) + 5, // Random posts between 5 and 24
      });
    }
    return data;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch total blog posts count
        const postsCountResponse = await apiService.getTotalBlogPostsCount();
        const totalPosts = postsCountResponse.data.data.count;

        // Fetch total registered users count
        const usersCountResponse = await apiService.getTotalUsersCount();
        const totalUsers = usersCountResponse.data.data.count;

        // Simulate fetching recent activity and chart data
        // In a real app, you would have separate API endpoints for these
        // Fetch recent activities (e.g., last 5)
        const activityResponse = await apiService.getActivityLogs({
          limit: 5,
          page: 1,
        });
        const fetchedRecentActivities = activityResponse.data.data.logs || [];
        setRecentActivities(fetchedRecentActivities);

        const monthlyPostsChartData = generateMonthlyPostsData(); // Generate dummy chart data

        setStats({
          totalPosts: totalPosts,
          totalUsers: totalUsers,
          postsChartData: monthlyPostsChartData, // Set the chart data
        });
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(
          err.response?.data?.message ||
            'Failed to load dashboard data. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert type="error" message={error} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Dashboard
      </h1>

      {showLoginSuccessAlert && loginSuccessMessage && (
        <Alert type="success" message={loginSuccessMessage} className="my-4" />
      )}

      {/* Dashboard statistics cards - Using StatCard component */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Blog Posts"
          value={stats.totalPosts}
          icon={<FaBlog />}
          color="bg-blue-500" // Tailwind color class
        />
        <StatCard
          title="Registered Users"
          value={stats.totalUsers}
          icon={<FaUsers />}
          color="bg-green-500" // Tailwind color class
        />
        {/* You can add more StatCards if you have other key metrics */}
        <Link to="/admin/activity-log">
          {/* Link to the new activity page */}
          <StatCard
            title="Recent Activity"
            value={recentActivities.length > 0 ? 'View All' : 'N/A'}
            icon={<FaClock />}
            color="bg-purple-500"
            isLink // Optional prop to style as a link if needed
          />
        </Link>
      </div>

      {/* Posts Chart - Using PostsChart component */}
      <div className="mt-8">
        {stats.postsChartData.length > 0 ? (
          <PostsChart data={stats.postsChartData} />
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="text-gray-600 dark:text-gray-300">
              No chart data available.
            </p>
          </div>
        )}
      </div>

      {/* Recent Activity Section (can be moved into its own component later) */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Recent Activity
        </h3>
        {recentActivities.length > 0 ? (
          <ul className="space-y-3">
            {recentActivities.map((activity) => (
              <li
                key={activity._id}
                className="text-gray-600 dark:text-gray-400 flex items-center"
              >
                <FaClock className="mr-2 text-sm" />
                <div className="flex-grow">
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {activity.userId?.username || 'System'}{' '}
                    {/* Display username if populated */}
                  </span>
                  : {activity.action}
                  {activity.entityType &&
                    activity.details?.title &&
                    ` (${activity.entityType}: ${activity.details.title})`}
                  {activity.entityType &&
                    !activity.details?.title &&
                    activity.entityId &&
                    ` (${activity.entityType} ID: ${activity.entityId})`}
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No recent activity available yet.
          </p>
        )}
      </div>

      {/* Additional dashboard sections can be added here */}
    </AdminLayout>
  );
};

export default DashboardPage;
