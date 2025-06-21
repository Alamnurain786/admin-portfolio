// src/components/Auth/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // console.log("ProtectedRoute rendered for path:", location.pathname);
    // console.log("ProtectedRoute state:", { isAuthenticated, loading, user, allowedRoles });
  }, [isAuthenticated, loading, user, allowedRoles, location.pathname]);

  if (loading) {
    // console.log("ProtectedRoute: Still loading auth status. Showing loading message.");
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-700 dark:text-gray-300">
        Loading authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    // console.log("ProtectedRoute: Not authenticated. Redirecting to /login.");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check if user has the required role
  if (allowedRoles && (!user || !allowedRoles.includes(user?.accessLevel))) {
    // console.log("ProtectedRoute: Authenticated but accessLevel not allowed.", {
    //   userAccessLevel: user?.accessLevel,
    //   allowedRoles,
    //   hasAccess: allowedRoles.includes(user?.accessLevel)
    // });
    return (
      <Navigate to="/admin/dashboard" replace state={{ from: location }} />
    );
  }

  // console.log("ProtectedRoute: Authenticated and authorized. Rendering children.");
  return children;
};

export default ProtectedRoute;
