// This component protects routes that require authentication.
// It checks if the user is logged in and has the correct role.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();

  // Show a loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // If the user is not logged in, redirect to the login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If the user's role is not in the allowed roles, redirect to login
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" />;
  }

  // If everything is ok, render the protected content
  return children;
}

export default ProtectedRoute;
