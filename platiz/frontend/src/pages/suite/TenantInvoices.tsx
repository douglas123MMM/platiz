import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import type { TenantSuite, TenantInvoice, TenantClient } from '../../types';
import toast from 'react-hot-toast';

const STATUS_BADGE: Record<string, string> = {
  draft: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  sent: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  paid: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  overdue: 'text-red-400 bg-red-500/10 border-red-500/20',
  cancelled: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  paid: 'Pagada',
  overdue: 'Vencida',
  cancelled: 'Cancelada',
};

interface LineItem {
  description: string;
  amount: string;
}

export default function TenantInvoices() {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<TenantSuite | null>(null);
  const [invoices, setInvoices] = useState<TenantInvoice[]>([]);
  const [clients, setClients] = useState<TenantClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    client_id: '',
    issue_date: '',
    due_date: '',
    notes: '',
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: '', amount: '' }]);

  useEffect(() => {
    loadTenant();
  }, [slug]);

  const loadTenant = async () => {
    try {
      const { data: tenants } = await api.get('/suite/tenants');
      const found = tenants.find((t: TenantSuite) => t.slug === slug);
      if (found) {
        setTenant(found);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenant) {
      loadInvoices();
      loadClients();
    }
  }, [tenant]);

  const loadInvoices = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/suite/tenants/${tenant.id}/invoices`);
      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    if (!tenant) return;
    try {
      const { data } = await api.get(`/suite/tenants/${tenant.id}/clients`);
      setClients(Array.isArray(data) ? data : []);
    } catch {
      setClients([]);
    }
  };

  const resetForm = () => {
    setForm({ client_id: '', issue_date: '', due_date: '', notes: '' });
    setLineItems([{ description: '', amount: '' }]);
    setShowModal(false);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', amount: '' }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    setLineItems(lineItems.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const tax = subtotal * 0.0;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.issue_date || !form.due_date) {
      toast.error('Completa los campos requeridos');
      return;
    }
    const { subtotal, tax, total } = calculateTotals();
    if (subtotal <= 0) {
      toast.error('Agrega al menos un item con monto');
      return;
    }
    if (!tenant) return;
    setSaving(true);
    const payload = {
      client_id: form.client_id,
      issue_date: form.issue_date,
      due_date: form.due_date,
      subtotal,
      tax,
      total,
      notes: form.notes,
      items: lineItems
        .filter((item) => item.description.trim() && parseFloat(item.amount) > 0)
        .map((item) => ({
          description: item.description,
          amount: parseFloat(item.amount),
        })),
    };
    try {
      await api.post(`/suite/tenants/${tenant.id}/invoices`, payload);
      toast.success('Factura creada');
      resetForm();
      loadInvoices();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al crear factura');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (invoice: TenantInvoice, newStatus: string) => {
    if (!tenant) return;
    try {
      await api.put(`/suite/tenants/${tenant.id}/invoices/${invoice.id}`, { status: newStatus });
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoice.id ? { ...inv, status: newStatus as TenantInvoice['status'] } : inv))
      );
      toast.success(`Factura ${STATUS_LABEL[newStatus]?.toLowerCase()}`);
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!tenant) return;
    if (!confirm('¿Eliminar esta factura?')) return;
    try {
      await api.delete(`/suite/tenants/${tenant.id}/invoices/${id}`);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      toast.success('Factura eliminada');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  const tabs = [
    { label: 'Configuracion', href: `/suite/tenants/${slug}` },
    { label: 'Clientes', href: `/suite/tenants/${slug}/clientes` },
    { label: 'Citas', href: `/suite/tenants/${slug}/citas` },
    { label: 'Servicios', href: `/suite/tenants/${slug}/servicios` },
    { label: 'Facturacion', href: `/suite/tenants/${slug}/facturacion` },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-white/30 text-sm mb-4">
          <Link to="/suite" className="hover:text-[#E5C158] transition">Suite</Link>
          <span className="mx-2">›</span>
          <Link to={`/suite/tenants/${slug}`} className="hover:text-[#E5C158] transition">
            {tenant?.name || slug}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-[#E5C158]">Facturacion</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Facturacion</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 transition"
          >
            + Nueva Factura
          </button>
        </div>

        <div className="flex items-center gap-1 mb-6 border-b border-white/[0.04] overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              to={tab.href}
              className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px whitespace-nowrap ${
                tab.label === 'Facturacion'
                  ? 'text-[#E5C158] border-[#E5C158]'
                  : 'text-white/40 border-transparent hover:text-white/70'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <div
              className="w-full max-w-xl bg-[#0a0a0f] border border-white/[0.04] rounded-xl p-6 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white mb-4">Nueva Factura</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <label className="block">
                  <span className="text-white/70 text-sm">Cliente *</span>
                  <select
                    value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                    className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#E5C158]/50 focus:outline-none"
                    required
                  >
                    <option value="" className="bg-[#0a0a0f]">Seleccionar cliente</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0a0a0f]">
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-white/70 text-sm">Fecha Emision *</span>
                    <input
                      type="date"
                      value={form.issue_date}
                      onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                      className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#E5C158]/50 focus:outline-none"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-white/70 text-sm">Fecha Vencimiento *</span>
                    <input
                      type="date"
                      value={form.due_date}
                      onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                      className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#E5C158]/50 focus:outline-none"
                      required
                    />
                  </label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm">Items</span>
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="text-xs text-[#E5C158] hover:underline"
                    >
                      + Agregar item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {lineItems.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                          placeholder="Descripcion"
                          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2 text-white text-sm placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                        />
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateLineItem(i, 'amount', e.target.value)}
                          placeholder="$0.00"
                          min="0"
                          step="0.01"
                          className="w-28 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2 text-white text-sm placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                        />
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLineItem(i)}
                            className="px-2 text-red-400 hover:text-red-300 text-sm"
                          >
                            x
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between text-white/40">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/40">
                      <span>Impuestos</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white font-semibold border-t border-white/[0.04] pt-1">
                      <span>Total</span>
                      <span className="text-[#E5C158]">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <label className="block">
                  <span className="text-white/70 text-sm">Notas</span>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none resize-none"
                  />
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 disabled:opacity-40 transition flex-1"
                  >
                    {saving ? 'Guardando...' : 'Crear Factura'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 hover:bg-white/[0.08] transition flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Numero</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60 hidden md:table-cell">Cliente</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60 hidden md:table-cell">Emision</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Vencimiento</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Total</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Estado</th>
                  <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-[#E5C158]/60">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-[#E5C158]/30 border-t-[#E5C158] rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="text-4xl mb-4">📄</div>
                      <h3 className="text-lg text-white mb-2">No hay facturas todavia</h3>
                      <p className="text-white/40 text-sm mb-4">Crea tu primera factura para este tenant</p>
                      <button
                        onClick={() => setShowModal(true)}
                        className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 transition text-sm"
                      >
                        + Nueva Factura
                      </button>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-medium text-white text-sm">{inv.invoice_number}</td>
                      <td className="p-4 text-white/50 text-sm hidden md:table-cell">{'—'}</td>
                      <td className="p-4 text-white/50 text-sm hidden md:table-cell">{inv.issue_date}</td>
                      <td className="p-4 text-white/70 text-sm">{inv.due_date}</td>
                      <td className="p-4 text-white font-medium text-sm">${(inv.total || 0).toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_BADGE[inv.status] || STATUS_BADGE.draft}`}>
                          {STATUS_LABEL[inv.status] || inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {inv.status === 'draft' && (
                            <button
                              onClick={() => updateStatus(inv, 'sent')}
                              className="px-2 py-1 text-xs rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                            >
                              Enviar
                            </button>
                          )}
                          {(inv.status === 'draft' || inv.status === 'sent') && (
                            <button
                              onClick={() => updateStatus(inv, 'paid')}
                              className="px-2 py-1 text-xs rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                            >
                              Pagar
                            </button>
                          )}
                          {inv.status !== 'cancelled' && inv.status !== 'paid' && (
                            <button
                              onClick={() => updateStatus(inv, 'cancelled')}
                              className="px-2 py-1 text-xs rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                            >
                              Cancelar
                            </button>
                          )}
                          <button
                            onClick={() => deleteInvoice(inv.id)}
                            className="px-2 py-1 text-xs rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition ml-1"
                          >
                            x
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
