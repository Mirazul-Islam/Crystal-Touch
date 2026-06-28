import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../ui/Spinner';
import type { Role } from '../../lib/types';

export function ProtectedRoute({
  allow,
  children,
}: {
  allow: Role[];
  children: ReactNode;
}) {
  const { session, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState label="Checking your session…" />;

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (role && !allow.includes(role)) {
    // Signed in but wrong role — send them to their own home.
    const home = role === 'admin' ? '/admin' : role === 'cleaner' ? '/cleaner' : '/';
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
