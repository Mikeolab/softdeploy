// src/components/RedirectIfAuthenticated.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RedirectIfAuthenticated({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}