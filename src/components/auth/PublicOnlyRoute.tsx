import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * Use for sign-in / sign-up pages.
 * If a user is already authenticated, send them to the right home:
 *  - Admins → /admin
 *  - Everyone else → /dashboard
 */
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, isAdmin, isLoading, authReady } = useAuth();

  if (isLoading || !authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}
