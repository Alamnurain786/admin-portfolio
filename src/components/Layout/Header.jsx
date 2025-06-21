// src/components/Layout/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import {
  FaBars,
  FaUserCircle,
  FaCaretDown,
  FaSun,
  FaMoon,
} from 'react-icons/fa'; // Add FaUserCircle, FaCaretDown, FaSun, FaMoon
import useDarkMode from '../../hooks/useDarkMode';
import { useAuth } from '../../context/AuthContext'; // Import useAuth for logout option in dropdown

const Header = ({ onMenuToggle }) => {
  const [colorTheme, setTheme] = useDarkMode();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref for the dropdown area
  const { logout } = useAuth(); // Get logout function from AuthContext

  // Effect to close dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    // Attach the event listener when the component mounts
    document.addEventListener('mousedown', handleClickOutside);
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  const handleLogout = () => {
    setProfileDropdownOpen(false); // Close dropdown
    logout(); // Call the logout function from your AuthContext
  };

  return (
    <header className="fixed top-0 right-0 h-16 bg-gray-50 dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center z-30 w-full md:w-[calc(100%-16rem)] md:left-64 left-0">
      {/* Hamburger menu button - visible only on small screens */}
      <button
        onClick={onMenuToggle}
        className="text-gray-700 dark:text-gray-300 text-2xl md:hidden focus:outline-none"
        aria-label="Toggle menu"
      >
        <FaBars />
      </button>

      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 hidden md:block">
        Dashboard Overview
      </h1>

      <div className="flex items-center space-x-4">
        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setTheme(colorTheme)}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle dark mode"
        >
          {colorTheme === 'dark' ? (
            <FaSun className="h-6 w-6" /> // Sun icon for light mode
          ) : (
            <FaMoon className="h-6 w-6" /> // Moon icon for dark mode
          )}
        </button>

        {/* Profile Button with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="User Profile Menu"
          >
            <FaUserCircle className="h-6 w-6" /> {/* User profile icon */}
            <FaCaretDown className="ml-2 text-sm" /> {/* Dropdown arrow icon */}
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
              <Link
                to="/admin/profile"
                onClick={() => setProfileDropdownOpen(false)} // Close dropdown when clicking link
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
