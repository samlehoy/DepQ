import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function UstadzRoute() {
  const { session, userRole } = useAuth();

  // If there is no active session, redirect to login page
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // If the user is not an ustadz, redirect to home
  if (userRole !== 'ustadz') {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the child routes
  return <Outlet />;
}

export default UstadzRoute;
