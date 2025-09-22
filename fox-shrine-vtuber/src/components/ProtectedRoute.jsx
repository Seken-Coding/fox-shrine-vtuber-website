import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-cinzel text-3xl mb-4">Authentication Required</h1>
          <a href="/login" className="fox-button">Go to Login</a>
        </div>
      </div>
    );
  }
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-cinzel text-3xl mb-4">Unauthorized</h1>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }
  return children;
}
