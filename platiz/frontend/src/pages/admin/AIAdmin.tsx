import { useState, useEffect } from 'react';
import api from '../../services/api';
import { AIProvider } from '../../types';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiPencil, HiChip, HiEye, HiEyeOff, HiLightningBolt } from 'react-icons/hi';

export default function AIAdmin() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', api_url: '', api_key: '', model: '' });
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/ai/providers').then((r) => setProviders(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ name: '', api_url: '', api_key: '', model: '' }); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.api_url) { toast.error('Nombre y URL requeridos'); return; }
    setLoading(true);
    try {
      if (editId) { await api.put(`/ai/providers/${editId}`, form); toast.success('Proveedor actualizado'); }
      else { await api.post('/ai/providers', form); toast.success('Proveedor conectado'); }
      resetForm(); load();
    } catch { toast.error('Error al guardar'); } finally { setLoading(false); }
  };

  const toggleActive = async (p: AIProvider) => {
    try { await api.put(`/ai/providers/${p.id}`, { active: p.active ? 0 : 1 }); load(); }
    catch { toast.error('Error'); }
  };

  const deleteProvider = async (id: string) => {
    if (!confirm('¿Eliminar proveedor de IA?')) return;
    try { await api.delete(`/ai/providers/${id}`); load(); toast.success('Eliminado'); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HiChip className="w-8 h-8 text-[#FFD700]" />
          <div>
            <h1 className="section-title text-2xl">Proveedores de IA</h1>
            <p className="section-subtitle">Conecta ChatGPT Plus, Gemini, Claude, Perplexity y más</p>
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2"><HiPlus className="w-4 h-4" /> Conectar IA</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg glass rounded-3xl p-8 border border-[#FFD700]/10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-6">{editId ? 'Editar' : 'Conectar'} Proveedor IA</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input className="input" placeholder="Ej: OpenAI, Google Gemini, Anthropic Claude..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">API URL</label>
                <input className="input" placeholder="https://api.openai.com/v1/chat/completions" value={form.api_url} onChange={(e) => setForm({ ...form, api_url: e.target.value })} required />
              </div>
              <div>
                <label className="label">API Key</label>
                <input className="input" placeholder="sk-..." value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} />
              </div>
              <div>
                <label className="label">Modelo (opcional)</label>
                <input className="input" placeholder="gpt-4, gemini-pro, claude-3, perplexity..." value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Conectando...' : editId ? 'Actualizar' : 'Conectar'}</button>
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((p) => (
          <div key={p.id} className={`card ${!p.active ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700]/15 to-[#DAA520]/10 rounded-2xl flex items-center justify-center"><HiChip className="w-6 h-6 text-[#FFD700]" /></div>
                <div>
                  <h3 className="font-semibold text-white">{p.name}</h3>
                  <span className={`badge ${p.active ? 'badge-success' : 'badge-danger'}`}>{p.active ? 'Activo' : 'Inactivo'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(p)} className="p-2 rounded-lg hover:bg-[#111] text-gray-400 hover:text-white transition-colors">{p.active ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}</button>
                <button onClick={() => { setForm({ name: p.name, api_url: p.api_url, api_key: p.api_key || '', model: p.model || '' }); setEditId(p.id); setShowForm(true); }} className="p-2 rounded-lg hover:bg-[#111] text-gray-400 hover:text-[#FFD700]"><HiPencil className="w-4 h-4" /></button>
                <button onClick={() => deleteProvider(p.id)} className="p-2 rounded-lg hover:bg-[#111] text-gray-400 hover:text-red-400"><HiTrash className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-400"><span className="text-gray-500">URL:</span> <span className="text-gray-300">{p.api_url}</span></p>
              {p.model && <p className="text-gray-400"><span className="text-gray-500">Modelo:</span> <span className="text-gray-300">{p.model}</span></p>}
              {p.api_key && <p className="text-gray-400"><span className="text-gray-500">API Key:</span> <span className="text-gray-300">{'•'.repeat(Math.min(p.api_key.length, 20))}</span></p>}
            </div>
          </div>
        ))}
        {providers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <HiChip className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">No hay proveedores de IA configurados</p>
            <p className="text-gray-600 text-xs mt-1">Conecta ChatGPT Plus, Gemini, Perplexity, Claude y más</p>
          </div>
        )}
      </div>
    </div>
  );
}
