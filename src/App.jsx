// src/App.jsx (Admin Panel)
import React, { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';

// lazily load components for better performance
const LoginPage = React.lazy(() => import('./pages/Auth/LoginPage'));
const DashboardPage = React.lazy(
  () => import('./pages/Dashboard/DashboardPage')
);
const BlogPostListPage = React.lazy(
  () => import('./pages/Blogs/BlogPostListPage')
);

// import LoginPage from './pages/Auth/LoginPage';
// import DashboardPage from './pages/Dashboard/DashboardPage';
// import BlogPostListPage from './pages/Blogs/BlogPostListPage';

// --- New Admin Pages ---
import CertificationsPage from './pages/Admin/CertificationsPage';
import ProjectsPage from './pages/Admin/ProjectsPage';
import SkillsPage from './pages/Admin/SkillsPage';
import UsersPage from './pages/Admin/UsersPage';
import SettingsPage from './pages/Admin/SettingsPage';
import ProfilePage from './pages/Admin/ProfilePage';
import ContactMessagesPage from './pages/Admin/ContactMessagesPage';
import MessageDetailPage from './pages/Admin/MessageDetailPage';

//import form pages
import SkillFormPage from './pages/FormPages/SkillFormPage';
import CertificationsFormPage from './pages/FormPages/CertificationsFormPage';
import ProjectsFormPage from './pages/FormPages/ProjectsFormPage';
import UserFormPage from './pages/FormPages/UsersFormPage';
import ActivityLogPage from './pages/Admin/ActivityLogPage';
import BlogPostFormPage from './pages/Blogs/BlogPostFormPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">
              <LoadingSpinner />
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor', 'user']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/posts"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <BlogPostListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/posts/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <BlogPostFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/posts/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <BlogPostFormPage />
                </ProtectedRoute>
              }
            />
            {/* Certifications routes */}
            <Route
              path="/admin/certifications"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <CertificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/certifications/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <CertificationsFormPage />
                  {/* used for creating new certifications */}
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/certifications/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <CertificationsFormPage />
                  {/* used for editing existing certifications */}
                </ProtectedRoute>
              }
            />
            {/* Projects routes */}
            <Route
              path="/admin/projects"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <ProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <ProjectsFormPage />
                  {/* used for creating new projects */}
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <ProjectsFormPage /> {/* Used: for edit Projects */}
                </ProtectedRoute>
              }
            />
            {/* Skills routes */}
            <Route
              path="/admin/skills"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <SkillsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/skills/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <SkillFormPage />
                  {/* skill form page for creating new skills */}
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/skills/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <SkillFormPage />{' '}
                  {/* skill form page for editing existing skills */}
                </ProtectedRoute>
              }
            />
            {/* --- NEWLY ADDED USERS MANAGEMENT ROUTES --- */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/new"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserFormPage />{' '}
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserFormPage />{' '}
                </ProtectedRoute>
              }
            />
            {/* --- NEWLY ADDED SETTINGS ROUTE --- */}
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            {/* --- NEWLY ADDED PROFILE ROUTE --- */}
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor', 'user']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor', 'user']}>
                  <ContactMessagesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/messages/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor', 'user']}>
                  <MessageDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Activity Log Page */}
            <Route
              path="/admin/activity-log"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <ActivityLogPage />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to dashboard if authenticated */}
            <Route
              path="/"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<p>Page not found</p>} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
