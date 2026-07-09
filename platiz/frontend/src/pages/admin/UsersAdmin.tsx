import { useState, useEffect } from 'react';
import api from '../../services/api';
import { User } from '../../types';
import toast from 'react-hot-toast';
import { HiCheck, HiX, HiRefresh, HiUserGroup, HiSearch, HiFilm } from 'react-icons/hi';

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moviesForAll, setMoviesForAll] = useState(false);
  const [passModal, setPassModal] = useState<string | null>(null);
  const [newPass, setNewPass] = useState('');

  const resetPassword = async (id: string) => {
    try {
      await api.patch(`/auth/users/${id}/password`, { password: newPass });
      toast.success('Contrasena actualizada');
      setPassModal(null);
      setNewPass('');
    } catch {
      toast.error('Error al cambiar contrasena');
    }
  };

  const loadUsers = (searchTerm?: string) => {
    setLoading(true);
    const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    api.get(`/auth/users${params}`).then((r) => setUsers(r.data)).catch(() => toast.error('Error al cargar usuarios')).finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleAll = async () => {
    const action = moviesForAll ? 'desactivar' : 'activar';
    if (!confirm(`¿${action} peliculas para TODOS los usuarios?`)) return;
    try {
      const endpoint = moviesForAll ? '/auth/users/deactivate-movies-all' : '/auth/users/activate-movies-all';
      const r = await api.post(endpoint);
      toast.success(`Peliculas ${action === 'activar' ? 'activadas' : 'desactivadas'} para ${r.data.count} usuarios`);
      setMoviesForAll(!moviesForAll);
      loadUsers(search);
    } catch { toast.error('Error al actualizar'); }
  };

  const toggleMovies = async (id: string) => {
    try {
      const r = await api.patch(`/auth/users/${id}/movies-access`);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, movies_access: r.data.movies_access } : u));
      toast.success(`Peliculas ${r.data.movies_access ? 'activadas' : 'desactivadas'}`);
    } catch { toast.error('Error al actualizar'); }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/auth/users/${id}/status`, { status });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));
      toast.success(`Usuario ${status === 'approved' ? 'aprobado como socio' : 'rechazado'}`);
    } catch { toast.error('Error al actualizar'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <HiUserGroup className="w-8 h-8 text-[#E5C158]" />
          <div>
            <h1 className="section-title text-2xl">Socios Global Dorado</h1>
            <p className="section-subtitle">Gestiona los socios de la plataforma</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleToggleAll} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${moviesForAll ? 'bg-emerald-500' : 'bg-gray-700'}`}>
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${moviesForAll ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-xs text-gray-400">{moviesForAll ? 'Películas ON' : 'Películas OFF'}</span>
          <button onClick={() => loadUsers(search)} className="btn-secondary flex items-center gap-2"><HiRefresh className="w-4 h-4" /> Actualizar</button>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 glass rounded-2xl border border-[#E5C158]/10 max-w-md">
        <HiSearch className="w-5 h-5 text-gray-500 flex-shrink-0" />
        <input type="text" placeholder="Buscar por nombre, email o teléfono..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-full" />
      </div>

      <div className="glass rounded-2xl border border-[#E5C158]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5C158]/10">
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Socio</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Email</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Teléfono</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Rol</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Estado</th>
                 <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Peliculas</th>
                 <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Registro</th>
                <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-12 text-center text-gray-500">Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="p-12 text-center text-gray-500">Sin socios registrados</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="border-b border-[#E5C158]/5 hover:bg-[#E5C158]/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#C4A44A] to-[#A6842C] rounded-lg flex items-center justify-center text-black font-bold text-sm">{user.username.charAt(0).toUpperCase()}</div>
                      <span className="font-medium text-white">{user.username}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{user.email}</td>
                  <td className="p-4 text-gray-400 text-sm">{user.phone || '—'}</td>
                  <td className="p-4"><span className={`badge ${user.role === 'admin' ? 'badge-gold' : 'badge-info'}`}>{user.role === 'admin' ? 'Admin' : 'Socio'}</span></td>
                  <td className="p-4">
                    <span className={`badge ${user.status === 'approved' ? 'badge-success' : user.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                      {user.status === 'approved' ? 'Aprobado' : user.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    <button
                      onClick={() => toggleMovies(user.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${user.movies_access ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'}`}
                    >
                      <HiFilm className="w-4 h-4 inline mr-1" />
                      {user.movies_access ? 'ON' : 'OFF'}
                    </button>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    {user.role !== 'admin' && user.status !== 'approved' && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => updateStatus(user.id, 'approved')} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Aprobar socio"><HiCheck className="w-4 h-4" /></button>
                        <button onClick={() => updateStatus(user.id, 'rejected')} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Rechazar"><HiX className="w-4 h-4" /></button>
                      </div>
                    )}
                    <button onClick={() => { setPassModal(user.id); setNewPass(''); }} className="ml-2 px-3 py-1.5 rounded-lg bg-[#E5C158] text-black text-xs font-bold hover:bg-[#F0D78C] transition-colors" title="Cambiar contrasena">Clave</button>
                    {user.role === 'admin' && <span className="text-xs text-[#E5C158]/60">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {passModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPassModal(null)}>
          <div className="bg-[#111] border border-[#E5C158]/20 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Cambiar Contrasena">
            <h3 className="text-white font-bold mb-4">Cambiar Contrasena</h3>
            <label className="label" htmlFor="new-password">Nueva contrasena</label>
            <input id="new-password" className="w-full bg-black/30 border border-[#E5C158]/10 rounded-lg px-3 py-2 text-sm text-white mb-4"
              type="text" placeholder="Nueva contrasena (min 6 caracteres)"
              value={newPass} onChange={e => setNewPass(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => resetPassword(passModal)} className="flex-1 py-2 bg-[#E5C158] text-black rounded-lg font-bold text-sm">Guardar</button>
              <button onClick={() => setPassModal(null)} className="flex-1 py-2 bg-white/10 text-white rounded-lg text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
