// src/components/Layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaFileAlt,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaAward,
  FaProjectDiagram,
  FaLaptopCode,
  FaBell,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext'; // Ensure correct path for AuthContext
import { useUnreadMessages } from '../../hooks/useUnreadMessages'; // Ensure correct path for UnreadMessagesContext

// Accept isOpen and setSidebarOpen props
const Sidebar = ({ isOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { unreadCount } = useUnreadMessages();

  const navItems = [
    {
      name: 'Dashboard',
      icon: FaHome,
      path: '/admin/dashboard',
      roles: ['admin', 'editor', 'user'],
    },
    {
      name: 'Blog Posts',
      icon: FaFileAlt,
      path: '/admin/posts',
      roles: ['admin', 'editor'],
    },
    {
      name: 'Certifications',
      icon: FaAward,
      path: '/admin/certifications',
      roles: ['admin', 'editor'],
    },
    {
      name: 'Projects',
      icon: FaProjectDiagram,
      path: '/admin/projects',
      roles: ['admin', 'editor'],
    },
    {
      name: 'Skills',
      icon: FaLaptopCode,
      path: '/admin/skills',
      roles: ['admin', 'editor'],
    },
    {
      name: 'Messages',
      path: '/admin/messages',
      icon: FaBell,
      roles: ['admin', 'editor'],
      badge: unreadCount > 0 ? unreadCount : null, // <-- Add badge for unread count
    },
    { name: 'Users', icon: FaUsers, path: '/admin/users', roles: ['admin'] },
    {
      name: 'Settings',
      icon: FaCog,
      path: '/admin/settings',
      roles: ['admin'],
    },
  ];

  // Function to close sidebar after clicking a link on mobile
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      // Check if it's a mobile screen (Tailwind's md breakpoint is 768px)
      setSidebarOpen(false);
    }
  };

  return (
    // Responsive classes: md:block makes it visible on desktop,
    // fixed/transform/transition control mobile sliding
    <div
      className={`
        fixed inset-y-0 left-0 w-64 bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-white p-4 flex flex-col shadow-lg z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:sticky md:top-0 md:h-screen md:w-64
      `}
    >
      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-8 text-center">
        Admin Panel
      </div>

      {user ? (
        <>
          <p className="text-gray-500 dark:text-gray-300 text-sm mb-6 text-center">
            Welcome, {user.username} ({user.accessLevel || 'No role'})
          </p>
          <nav className="flex-grow">
            <ul>
              {navItems.map((item) => {
                const hasAccess = user && item.roles.includes(user.accessLevel);

                return hasAccess ? (
                  <li key={item.name} className="mb-2">
                    <Link
                      to={item.path}
                      onClick={handleLinkClick} // Close sidebar on link click
                      className={`flex items-center p-3 rounded-lg transition-colors duration-200
                        ${
                          location.pathname.startsWith(item.path)
                            ? 'bg-blue-600 text-white dark:bg-blue-700 dark:text-white'
                            : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                      <item.icon className="mr-3" />
                      {item.name}
                    </Link>
                  </li>
                ) : null;
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                logout();
                handleLinkClick();
              }} // Close sidebar after logout
              className="flex items-center w-full p-3 rounded-lg text-red-600 hover:bg-gray-200 hover:text-red-800 transition-colors duration-200 dark:hover:bg-gray-800 dark:text-red-400 dark:hover:text-red-200"
            >
              <FaSignOutAlt className="mr-3" />
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-300">
            Loading user data...
          </p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
