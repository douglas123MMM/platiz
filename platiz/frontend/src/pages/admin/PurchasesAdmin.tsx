import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { IconRefresh, IconGrid } from '../../icons/PremiumIcons';

interface Purchase {
  id: string;
  user_id: string;
  product_title: string;
  amount: number;
  status: string;
  status_display: string;
  expires_at?: string;
  created_at: string;
  user?: {
    username: string;
    email: string;
    phone?: string;
  };
}

export default function PurchasesAdmin() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPurchases = () => {
    setLoading(true);
    api.get('/store/admin/purchases')
      .then((r) => setPurchases(r.data))
      .catch(() => toast.error('Error al cargar compras'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPurchases(); }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const statusStyle = (status: string) => {
    const styles: Record<string, string> = {
      'Activo': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Vencido': 'bg-red-500/10 text-red-400 border-red-500/20',
      'Permanente': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    };
    return styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <IconGrid className="w-8 h-8 text-[#FFD700]" />
          <div>
            <h1 className="section-title text-2xl">Compras</h1>
            <p className="section-subtitle">Historial de compras de la tienda</p>
          </div>
        </div>
        <button onClick={loadPurchases} className="btn-secondary flex items-center gap-2">
          <IconRefresh className="w-4 h-4" /> Actualizar
        </button>
      </div>

      <div className="glass rounded-2xl border border-[#FFD700]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#FFD700]/10">
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Usuario</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Email</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Telefono</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Producto</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Monto</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Estado</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Vence</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Accion</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-12 text-center text-gray-500">Cargando...</td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={8} className="p-12 text-center text-gray-500">Sin compras registradas</td></tr>
              ) : purchases.map((p) => (
                <tr key={p.id} className="border-b border-[#FFD700]/5 hover:bg-[#FFD700]/5 transition-colors">
                  <td className="p-4 text-white text-sm font-medium">{p.user?.username || 'N/A'}</td>
                  <td className="p-4 text-gray-400 text-sm">{p.user?.email || 'N/A'}</td>
                  <td className="p-4 text-gray-400 text-sm">{p.user?.phone || '-'}</td>
                  <td className="p-4 text-white text-sm font-medium">{p.product_title}</td>
                  <td className="p-4 text-[#FFD700] text-sm font-bold">${Number(p.amount).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle(p.status_display)}`}>
                      {p.status_display}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">
                    {p.expires_at ? formatDate(p.expires_at) : 'Permanente'}
                  </td>
                  <td className="p-4">
                    {p.user?.phone ? (
                      <a
                        href={`https://wa.me/${p.user.phone.replace(/\D/g, '')}?text=Hola%20${p.user.username},%20tu%20servicio%20${p.product_title}%20esta%20${p.status_display === 'Vencido' ? 'vencido' : 'activo'}.%20Quieres%20renovarlo%3F`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs hover:bg-green-500/20 transition-colors"
                      >
                        WhatsApp
                      </a>
                    ) : (
                      <span className="text-gray-600 text-xs">Sin telefono</span>
                    )}
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
