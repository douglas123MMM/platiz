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
  if (user.role !== 'admin' && user.status !== 'approved') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-8 md:p-12 text-center max-w-md border border-[#FFD700]/10">
          <div className="w-16 h-16 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">{user.status === 'rejected' ? '❌' : '👑'}</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{user.status === 'rejected' ? 'Acceso denegado' : 'Cuenta pendiente'}</h2>
          <p className="text-gray-400">{user.status === 'rejected' ? 'Tu solicitud ha sido rechazada.' : 'Tu solicitud esta siendo revisada.'}</p>
        </div>
      </div>
    );
  }
  return children;
}
