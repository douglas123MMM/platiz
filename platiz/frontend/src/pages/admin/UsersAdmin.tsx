import { useState, useEffect } from 'react';
import api from '../../services/api';
import { User } from '../../types';
import toast from 'react-hot-toast';
import { HiCheck, HiX, HiRefresh, HiUserGroup } from 'react-icons/hi';

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    setLoading(true);
    api.get('/auth/users').then((r) => setUsers(r.data)).catch(() => toast.error('Error al cargar usuarios')).finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/auth/users/${id}/status`, { status });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));
      toast.success(`Usuario ${status === 'approved' ? 'aprobado como socio' : 'rechazado'}`);
    } catch { toast.error('Error al actualizar'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HiUserGroup className="w-8 h-8 text-[#FFD700]" />
          <div>
            <h1 className="section-title text-2xl">Socios Global Dorado</h1>
            <p className="section-subtitle">Gestiona los socios de la plataforma</p>
          </div>
        </div>
        <button onClick={loadUsers} className="btn-secondary flex items-center gap-2"><HiRefresh className="w-4 h-4" /> Actualizar</button>
      </div>
      <div className="glass rounded-2xl border border-[#FFD700]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#FFD700]/10">
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Socio</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Email</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Rol</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Estado</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Registro</th>
                <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500">Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500">Sin socios registrados</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="border-b border-[#FFD700]/5 hover:bg-[#FFD700]/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#DAA520] to-[#B8860B] rounded-lg flex items-center justify-center text-black font-bold text-sm">{user.username.charAt(0).toUpperCase()}</div>
                      <span className="font-medium text-white">{user.username}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{user.email}</td>
                  <td className="p-4"><span className={`badge ${user.role === 'admin' ? 'badge-gold' : 'badge-info'}`}>{user.role === 'admin' ? 'Admin' : 'Socio'}</span></td>
                  <td className="p-4">
                    <span className={`badge ${user.status === 'approved' ? 'badge-success' : user.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                      {user.status === 'approved' ? 'Aprobado' : user.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    {user.role !== 'admin' && user.status !== 'approved' && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => updateStatus(user.id, 'approved')} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Aprobar socio"><HiCheck className="w-4 h-4" /></button>
                        <button onClick={() => updateStatus(user.id, 'rejected')} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Rechazar"><HiX className="w-4 h-4" /></button>
                      </div>
                    )}
                    {user.role === 'admin' && <span className="text-xs text-[#FFD700]/60">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
