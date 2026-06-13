import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { IconRefresh, IconChat } from '../../icons/PremiumIcons';

interface Recharge {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  proof_image?: string;
  user?: {
    username: string;
    email: string;
    phone?: string;
  };
}

export default function RechargesAdmin() {
  const [recharges, setRecharges] = useState<Recharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  const loadRecharges = () => {
    setLoading(true);
    api.get(`/store/admin/recharges?status=${statusFilter}`)
      .then((r) => setRecharges(r.data))
      .catch(() => toast.error('Error al cargar recargas'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRecharges(); }, [statusFilter]);

  const handleAction = async (id: string, status: 'completed' | 'rejected') => {
    try {
      await api.patch(`/store/admin/recharges/${id}`, { status });
      toast.success(status === 'completed' ? 'Recarga aprobada' : 'Recarga rechazada');
      loadRecharges();
    } catch {
      toast.error('Error al actualizar recarga');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      completed: 'Aprobado',
      rejected: 'Rechazado',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <IconChat className="w-8 h-8 text-[#FFD700]" />
          <div>
            <h1 className="section-title text-2xl">Recargas</h1>
            <p className="section-subtitle">Gestionar recargas via Binance Pay</p>
          </div>
        </div>
        <button onClick={loadRecharges} className="btn-secondary flex items-center gap-2">
          <IconRefresh className="w-4 h-4" /> Actualizar
        </button>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'pending', label: 'Pendientes' },
          { key: 'all', label: 'Todas' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === f.key
                ? 'bg-[#FFD700] text-black'
                : 'bg-white/[0.03] text-gray-400 border border-[#FFD700]/15 hover:text-[#FFD700]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl border border-[#FFD700]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#FFD700]/10">
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Usuario</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Monto</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Comprobante</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Fecha</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Estado</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Accion</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500">Cargando...</td></tr>
              ) : recharges.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500">No hay recargas{statusFilter === 'pending' ? ' pendientes' : ''}</td></tr>
              ) : recharges.map((r) => (
                <tr key={r.id} className="border-b border-[#FFD700]/5 hover:bg-[#FFD700]/5 transition-colors">
                  <td className="p-4">
                    <p className="text-white text-sm font-medium">{r.user?.username || 'Usuario'}</p>
                    <p className="text-gray-500 text-xs">{r.user?.email || ''}</p>
                    {r.user?.phone && <p className="text-gray-600 text-xs">{r.user.phone}</p>}
                  </td>
                  <td className="p-4 text-[#FFD700] text-sm font-bold">${r.amount.toFixed(2)} USDT</td>
                  <td className="p-4">
                    {r.proof_image ? (
                      <img
                        src={r.proof_image}
                        alt="Comprobante"
                        className="w-10 h-10 rounded-lg object-cover cursor-pointer hover:ring-2 ring-[#FFD700] transition-all"
                        onClick={() => setPreviewImage(r.proof_image!)}
                      />
                    ) : (
                      <span className="text-gray-600 text-xs">Sin comprobante</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{formatDate(r.created_at)}</td>
                  <td className="p-4">{statusBadge(r.status)}</td>
                  <td className="p-4">
                    {r.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(r.id, 'completed')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleAction(r.id, 'rejected')}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
                        >
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewImage('')}>
          <img src={previewImage} alt="Comprobante" className="max-w-full max-h-[90vh] rounded-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
