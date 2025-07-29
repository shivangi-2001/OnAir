import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext'; 

interface AuthRouteProps {
  requireAuth: boolean; // true for protected routes, false for auth pages (signin/signup)
}

export const AuthRoute: React.FC<AuthRouteProps> = ({ requireAuth }) => {
  const { user, loading } = useAuth();

  // Show a loading indicator while authentication status is being determined
  if (loading) {
    // You can replace this with a proper spinner or loading screen
    return <div>Loading authentication...</div>;
  }

  // Logic for Protected Routes (requireAuth = true)
  if (requireAuth) {
    if (!user) {
      // User is not authenticated, redirect to signin
      return <Navigate to="/signin" replace />; // `replace` prevents adding to history
    }
  }
  // Logic for Auth Pages (requireAuth = false)
  else { // i.e., !requireAuth (for signin/signup)
    if (user) {
      // User is authenticated, redirect away from signin/signup
      return <Navigate to="/" replace />; // Or to a dashboard page like /dashboard
    }
  }

  // If conditions are met, render the nested routes (children via Outlet)
  return <Outlet />;
};