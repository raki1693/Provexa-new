import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-provexa-bg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-provexa-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading PROVEXA...</p>
        </div>
      </div>
    );
  }

  if (!user || !role) {
    return <Navigate to={`/${allowedRole}/login`} replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
