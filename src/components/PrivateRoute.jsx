import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute() {
  const { session } = useAuth();

  // If there is no active session, redirect to login page
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the child routes (Layout)
  return <Outlet />;
}

export default PrivateRoute;
