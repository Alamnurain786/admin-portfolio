// src/components/Layout/AdminLayout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // State to control sidebar visibility

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {' '}
        {/* md:ml-64 pushes content on desktop */}
        {/* Header */}
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 mt-10 overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
          {children}
        </main>
      </div>

      {/* Mobile Overlay (appears when sidebar is open on small screens) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)} // Close sidebar when clicking overlay
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;
