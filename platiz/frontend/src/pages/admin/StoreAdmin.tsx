import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { IconPlus, IconPencil, IconTrash, IconRefresh, IconEye, IconEyeOff, IconGrid, IconSearch } from '../../icons/PremiumIcons';
import { uploadVideoToStorage } from '../../services/supabase';

const CATEGORIES = [
  'Streaming', 'Creatividad', 'Diseno Grafico', 'Edicion de Videos',
  'Herramientas', 'Antivirus', 'Oficina', 'Licencia', 'Monedas de Juegos',
  'Redes Sociales',
];

interface Product {
  id: string;
  image_url: string;
  category: string;
  title: string;
  description: string;
  terms: string;
  purchase_instructions: string;
  price: number;
  support_number: string;
  delivery_email: string;
  delivery_password: string;
  stock: number;
  account_type: string;
  duration_days: number;
  delivery_type: string;
  product_type: string;
  renewable: boolean;
  vendor_name: string;
  active: boolean;
  created_at: string;
}

const emptyProduct: Product = {
  id: '',
  image_url: '',
  category: '',
  title: '',
  description: '',
  terms: '',
  purchase_instructions: '',
  price: 0,
  support_number: '',
  delivery_email: '',
  delivery_password: '',
  stock: 0,
  account_type: 'temporal',
  duration_days: 0,
  delivery_type: 'automatica',
  product_type: 'cuenta',
  renewable: false,
  vendor_name: '',
  active: true,
  created_at: '',
};

export default function StoreAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product>(emptyProduct);
  const [showPass, setShowPass] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [variants, setVariants] = useState<{label: string; price: number}[]>([]);

  const addVariant = () => setVariants([...variants, { label: '', price: 0 }]);
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: 'label'|'price', val: string) => {
    const v = [...variants];
    if (field === 'price') { v[i].price = parseFloat(val) || 0; }
    else { v[i].label = val; }
    setVariants(v);
  };

  const loadProducts = () => {
    setLoading(true);
    api.get('/store/admin/products')
      .then((r) => setProducts(r.data))
      .catch(() => toast.error('Error al cargar productos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);

  const openNew = () => {
    setEditing({ ...emptyProduct });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing({ ...p });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing.title || !editing.category) {
      toast.error('Título y categoría son obligatorios');
      return;
    }
    try {
      if (editing.id) {
        await api.put(`/store/products/${editing.id}`, { ...editing, variants });
        toast.success('Producto actualizado');
      } else {
        await api.post('/store/products', { ...editing, variants });
        toast.success('Producto creado');
      }
      setModalOpen(false);
      loadProducts();
    } catch {
      toast.error('Error al guardar producto');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/store/products/${id}`);
      toast.success('Producto eliminado');
      setDeleteId(null);
      loadProducts();
    } catch {
      toast.error('Error al eliminar producto');
    }
  };

  const updateField = (field: keyof Product, value: any) => {
    setEditing((prev) => ({ ...prev, [field]: value }));
  };

  const filteredProducts = search.trim()
    ? products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <IconGrid className="w-8 h-8 text-[#FFD700]" />
          <div>
            <h1 className="section-title text-2xl">Gestión de Tienda</h1>
            <p className="section-subtitle">Administra los productos de la tienda</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={openNew} className="btn-secondary flex items-center gap-2 bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/20 hover:bg-[#FFD700]/20">
            <IconPlus className="w-4 h-4" /> Agregar Producto
          </button>
          <button onClick={loadProducts} className="btn-secondary flex items-center gap-2">
            <IconRefresh className="w-4 h-4" /> Actualizar
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <IconSearch className="w-5 h-5 text-gray-500 flex-shrink-0" />
        <input type="text" placeholder="Buscar producto por nombre o categoria..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-full" />
      </div>

      <div className="glass rounded-2xl border border-[#FFD700]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#FFD700]/10">
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Imagen</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Título</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Categoría</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Precio</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Stock</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Tipo</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Estado</th>
                <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-12 text-center text-gray-500">Cargando...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={8} className="p-12 text-center text-gray-500">{search ? 'Sin resultados' : 'Sin productos registrados'}</td></tr>
              ) : filteredProducts.map((p) => (
                <tr key={p.id} className="border-b border-[#FFD700]/5 hover:bg-[#FFD700]/5 transition-colors">
                  <td className="p-4">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} className="w-10 h-10 rounded-lg object-cover border border-[#FFD700]/10" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]/40">
                        <IconGrid className="w-5 h-5" />
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-white text-sm font-medium">{p.title}</td>
                  <td className="p-4">
                    <span className="badge badge-gold text-xs">{p.category}</span>
                  </td>
                  <td className="p-4 text-[#FFD700] text-sm font-bold">${Number(p.price).toFixed(2)}</td>
                  <td className="p-4 text-gray-400 text-sm">
                    {p.stock > 0 ? p.stock : <span className="text-[#FFD700]/60">Ilimitado</span>}
                  </td>
                  <td className="p-4">
                    <span className={`badge ${p.delivery_type === 'automatica' ? 'badge-info' : 'badge-warning'}`}>
                      {p.delivery_type === 'automatica' ? 'Automática' : 'Manual'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${p.active ? 'badge-success' : 'badge-danger'}`}>
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20 transition-colors" title="Editar">
                        <IconPencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Eliminar">
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)}>
          <div className="bg-[#111] border border-[#FFD700]/20 rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-bold mb-2">Eliminar Producto</h3>
            <p className="text-gray-400 text-sm mb-6">¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 bg-red-500 text-white rounded-lg font-bold text-sm">Eliminar</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 bg-white/10 text-white rounded-lg text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="fixed inset-0 bg-[#0a0a0f]/95 backdrop-blur-xl" />
          <div
            className="relative bg-[#0a0a0f] border border-[#FFD700]/20 rounded-2xl p-4 md:p-6 w-full max-w-full md:max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl shadow-black/50 mx-1 md:mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-6">
              {editing.id ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#FFD700]/60 mb-1">URL de Imagen</label>
                <div className="flex gap-2">
                <input
                  type="text"
                  value={editing.image_url}
                  onChange={(e) => updateField('image_url', e.target.value)}
                  className="flex-1 bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FFD700]/30"
                  placeholder="https://..."
                />
                <label className={`flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer text-xs font-medium whitespace-nowrap ${imageUploading ? 'bg-gray-600 text-gray-300' : 'bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20 border border-[#FFD700]/20'}`}>
                  {imageUploading ? 'Subiendo...' : 'Subir imagen'}
                  <input type="file" accept="image/*" onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setImageUploading(true);
                    try { const url = await uploadVideoToStorage(f); updateField('image_url', url); toast.success('Imagen subida'); }
                    catch { toast.error('Error al subir imagen'); }
                    setImageUploading(false);
                  }} className="hidden" />
                </label>
                </div>
                {editing.image_url && (
                  <img src={editing.image_url} alt="" className="mt-2 w-20 h-20 rounded-lg object-contain bg-black/30 border border-[#FFD700]/10" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFD700]/60 mb-1">Categoría</label>
                <select
                  value={editing.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FFD700]/30"
                >
                  <option value="">Seleccionar...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFD700]/60 mb-1">Título</label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FFD700]/30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#FFD700]/60 mb-1">Descripción</label>
                <textarea
                  value={editing.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FFD700]/30 resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#FFD700]/60 mb-1">Términos y Condiciones</label>
                <textarea
                  value={editing.terms}
                  onChange={(e) => updateField('terms', e.target.value)}
                  rows={3}
                  className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FFD700]/30 resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#FFD700]/60 mb-1">Instrucciones de Compra (visible tras la compra)</label>
                <textarea
                  value={editing.purchase_instructions}
                  onChange={(e) => updateField('purchase_instructions', e.target.value)}
                  rows={3}
                  placeholder="Ej: Recibiras un correo en 2-4 horas con los datos de acceso..."
                  className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FFD700]/30 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFD700]/60 mb-1">Precio</label>
                <input
                  type="number"
                  value={editing.price}
                  onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FFD700]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFD700]/60 mb-1">Número de Soporte</label>
                <input
                  type="text"
                  value={editing.support_number}
                  onChange={(e) => updateField('support_number', e.target.value)}
                  className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FFD700]/30"
                />
              </div>

              {editing.delivery_type === 'automatica' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#FFD700]/60 mb-1">Email de Entrega</label>
                    <input
                      type="text"
                      value={editing.delivery_email}
                      onChange={(e) => updateField('delivery_email', e.target.value)}
                      className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FFD700]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#FFD700]/60 mb-1">Contraseña de Entrega</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={editing.delivery_password}
                        onChange={(e) => updateField('delivery_password', e.target.value)}
                        className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FFD700]/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#FFD700] transition-colors"
                      >
                        {showPass ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 text-yellow-400/60 text-xs">
                  Entrega manual: las credenciales se enviaran al cliente por otro medio.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#FFD700]/60 mb-1">Stock</label>
                <input
                  type="number"
                  value={editing.stock}
                  onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)}
                  className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FFD700]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFD700]/60 mb-1">Tipo de Cuenta</label>
                <div className="flex rounded-lg overflow-hidden border border-[#FFD700]/10">
                  <button
                    type="button"
                    onClick={() => updateField('account_type', 'temporal')}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${editing.account_type === 'temporal' ? 'bg-[#FFD700] text-black font-bold' : 'bg-white/[0.03] text-gray-400 border border-[#FFD700]/15'}`}
                    >
                    Temporal
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('account_type', 'permanente')}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${editing.account_type === 'permanente' ? 'bg-[#FFD700] text-black font-bold' : 'bg-white/[0.03] text-gray-400 border border-[#FFD700]/15'}`}
                    >
                    Permanente
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFD700]/60 mb-1">Duración (días)</label>
                <input
                  type="number"
                  value={editing.duration_days}
                  onChange={(e) => updateField('duration_days', parseInt(e.target.value) || 0)}
                  className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FFD700]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFD700]/60 mb-1">Tipo de Entrega</label>
                <div className="flex rounded-lg overflow-hidden border border-[#FFD700]/10">
                  <button
                    type="button"
                    onClick={() => updateField('delivery_type', 'automatica')}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${editing.delivery_type === 'automatica' ? 'bg-[#FFD700] text-black font-bold' : 'bg-white/[0.03] text-gray-400 border border-[#FFD700]/15'}`}
                    >
                    Automática
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('delivery_type', 'Manual')}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${editing.delivery_type === 'Manual' ? 'bg-[#FFD700]/15 text-[#FFD700]' : 'bg-black/30 text-gray-400 hover:bg-[#FFD700]/5'}`}
                  >
                    Manual
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFD700]/60 mb-1">Tipo de Producto</label>
                <div className="flex rounded-lg overflow-hidden border border-[#FFD700]/10">
                  <button
                    type="button"
                    onClick={() => updateField('product_type', 'cuenta')}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${editing.product_type === 'cuenta' ? 'bg-[#FFD700] text-black font-bold' : 'bg-white/[0.03] text-gray-400 border border-[#FFD700]/15'}`}
                  >
                    Cuenta Completa
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('product_type', 'perfil')}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${editing.product_type === 'perfil' ? 'bg-[#FFD700]/15 text-[#FFD700]' : 'bg-black/30 text-gray-400 hover:bg-[#FFD700]/5'}`}
                  >
                    Perfil
                  </button>
                </div>
              </div>

              {/* Variantes */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#FFD700]/60">Variantes (Perfil/Completa)</label>
                  <button type="button" onClick={addVariant} className="text-xs px-2 py-1 rounded bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20">+ Agregar</button>
                </div>
                {variants.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input type="text" placeholder="Completa/Perfil" value={v.label} onChange={(e) => updateVariant(i, 'label', e.target.value)} className="flex-1 bg-black/30 border border-[#FFD700]/10 rounded px-3 py-1.5 text-sm text-white outline-none focus:border-[#FFD700]/30" />
                    <span className="text-gray-400 text-xs">$</span>
                    <input type="number" min="0" step="0.5" value={v.price || ''} onChange={(e) => updateVariant(i, 'price', e.target.value)} className="w-20 bg-black/30 border border-[#FFD700]/10 rounded px-3 py-1.5 text-sm text-white outline-none focus:border-[#FFD700]/30" />
                    <button onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-300">&times;</button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFD700]/60 mb-1">Vendedor</label>
                <input
                  type="text"
                  value={editing.vendor_name}
                  onChange={(e) => updateField('vendor_name', e.target.value)}
                  className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FFD700]/30"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.renewable}
                    onChange={(e) => updateField('renewable', e.target.checked)}
                    className="w-4 h-4 rounded border-[#FFD700]/30 bg-black/30 text-[#FFD700] focus:ring-[#FFD700]/20"
                  />
                  <span className="text-sm text-gray-300">Renovable</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.active}
                    onChange={(e) => updateField('active', e.target.checked)}
                    className="w-4 h-4 rounded border-[#FFD700]/30 bg-black/30 text-[#FFD700] focus:ring-[#FFD700]/20"
                  />
                  <span className="text-sm text-gray-300">Activo</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#FFD700]/10">
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-[#FFD700] text-black rounded-lg font-bold text-sm hover:bg-[#FFE44D] transition-colors"
              >
                {editing.id ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
