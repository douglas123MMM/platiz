import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CrownIcon } from './Logo';

export function ProtectedRoute({ children, requireAdmin = false }: { children: JSX.Element; requireAdmin?: boolean }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <CrownIcon size={64} className="animate-pulse" />
          <div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Cargando Global Dorado...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
