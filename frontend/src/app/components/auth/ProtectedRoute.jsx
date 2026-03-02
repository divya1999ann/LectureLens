import React from 'react';
import { Navigate } from 'react-router';
import useAuthStore from '../../store/authStore';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 'any' role means any authenticated user can access
  if (role && role !== 'any' && user?.role !== role) {
    // Redirect to the appropriate dashboard based on the user's actual role
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'teacher') {
      return <Navigate to="/teacher/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;