import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Store {
  id: string; user_id: string; slug: string; store_name: string;
  description: string; logo_url: string; whatsapp: string;
  primary_color: string; accent_color: string; text_color: string; card_color: string;
  is_active: boolean;
}

interface Product {
  id: string; store_id: string; name: string; description: string;
  price: number; image_url: string; category: string; is_active: boolean;
}

const COLORS = [
  { name: 'Verde', primary: '#0A0A0A', accent: '#25D366', text: '#FFFFFF', card: '#1A1A2E' },
  { name: 'Dorado', primary: '#0A0A0A', accent: '#D4AF37', text: '#FFFFFF', card: '#1A1A2E' },
  { name: 'Azul', primary: '#0F172A', accent: '#3B82F6', text: '#FFFFFF', card: '#1E293B' },
  { name: 'Rojo', primary: '#1A0A0A', accent: '#EF4444', text: '#FFFFFF', card: '#2E1A1A' },
  { name: 'Rosa', primary: '#1A0A1A', accent: '#EC4899', text: '#FFFFFF', card: '#2E1A2E' },
  { name: 'Naranja', primary: '#1A100A', accent: '#F97316', text: '#FFFFFF', card: '#2E201A' },
  { name: 'Blanco', primary: '#F8FAFC', accent: '#0F172A', text: '#1E293B', card: '#FFFFFF' },
  { name: 'Gris', primary: '#1A1A1A', accent: '#6B7280', text: '#FFFFFF', card: '#2A2A2A' },
];

export default function MyStorePage() {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Store form
  const [showCreate, setShowCreate] = useState(false);
  const [slug, setSlug] = useState('');
  const [slugOk, setSlugOk] = useState<boolean | null>(null);
  const [storeName, setStoreName] = useState('Mi Tienda');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  // Product form
  const [showProduct, setShowProduct] = useState(false);
  const [prodForm, setProdForm] = useState({ name: '', price: '', description: '', image_url: '', category: 'General' });
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  // Colors
  const [selectedPalette, setSelectedPalette] = useState(0);
  const [customColors, setCustomColors] = useState(COLORS[0]);

  const storeUrl = store ? `https://globalservicex.com/tienda/${store.slug}` : '';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await api.get('/storefront/my-store');
      if (data) {
        setStore(data);
        setStoreName(data.store_name);
        setWhatsapp(data.whatsapp || '');
        setDescription(data.description || '');
        setBannerUrl(data.banner_url || '');
        // Load products
        const { data: prods } = await api.get(`/storefront/store/${data.id}/products`);
        setProducts(prods || []);
      }
    } catch { /* no store yet */ }
    finally { setLoading(false); }
  };

  const checkSlug = async () => {
    if (!slug) return;
    try {
      const { data } = await api.get(`/storefront/check-slug?slug=${encodeURIComponent(slug)}`);
      setSlugOk(data.available);
      if (data.available) setSlug(data.slug);
    } catch { setSlugOk(null); }
  };

  const handleCreate = async () => {
    if (!slug || !slugOk) { toast.error('Elegi un link valido'); return; }
    if (!whatsapp) { toast.error('Pone tu numero de WhatsApp'); return; }
    setSaving(true);
    try {
      const { data } = await api.post('/storefront/store', {
        store_name: storeName,
        slug,
        description,
        whatsapp: whatsapp.replace(/\D/g, ''),
        ...customColors
      });
      setStore(data);
      setShowCreate(false);
      toast.success('Tienda creada');
    } catch (e: any) { toast.error(e.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handleUpdateColors = async (palette: typeof COLORS[0], index: number) => {
    setSelectedPalette(index);
    setCustomColors(palette);
    if (!store) return;
    try {
      await api.put(`/storefront/store/${store.id}`, {
        primary_color: palette.primary,
        accent_color: palette.accent,
        text_color: palette.text,
        card_color: palette.card
      });
      setStore({ ...store, ...palette });
      toast.success('Colores actualizados');
    } catch { toast.error('Error'); }
  };

  const handleUpdateInfo = async () => {
    if (!store) return;
    try {
      await api.put(`/storefront/store/${store.id}`, {
        store_name: storeName,
        description,
        whatsapp: whatsapp.replace(/\D/g, ''),
        banner_url: bannerUrl
      });
      setStore({ ...store, store_name: storeName, description, whatsapp });
      toast.success('Actualizado');
    } catch { toast.error('Error'); }
  };

  const handleToggleActive = async () => {
    if (!store) return;
    try {
      await api.put(`/storefront/store/${store.id}`, { is_active: !store.is_active });
      setStore({ ...store, is_active: !store.is_active });
    } catch { toast.error('Error'); }
  };

  const handleSaveProduct = async () => {
    if (!store) return;
    if (!prodForm.name || !prodForm.price) { toast.error('Nombre y precio requeridos'); return; }
    try {
      if (editingProduct) {
        await api.put(`/storefront/store/${store.id}/products/${editingProduct}`, prodForm);
        toast.success('Producto actualizado');
      } else {
        await api.post(`/storefront/store/${store.id}/products`, prodForm);
        toast.success('Producto agregado');
      }
      setShowProduct(false);
      setProdForm({ name: '', price: '', description: '', image_url: '', category: 'General' });
      setEditingProduct(null);
      const { data } = await api.get(`/storefront/store/${store.id}/products`);
      setProducts(data || []);
    } catch { toast.error('Error'); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!store || !confirm('Eliminar producto?')) return;
    try {
      await api.delete(`/storefront/store/${store.id}/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Eliminado');
    } catch { toast.error('Error'); }
  };

  const editProduct = (p: Product) => {
    setProdForm({ name: p.name, price: String(p.price), description: p.description, image_url: p.image_url, category: p.category });
    setEditingProduct(p.id);
    setShowProduct(true);
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#E5C158]/30 border-t-[#E5C158] rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Mi Tienda Virtual</h1>
            <p className="text-white/40 text-sm">Crea tu catalogo online y vende por WhatsApp</p>
          </div>
          {store && (
            <button onClick={() => navigator.clipboard.writeText(storeUrl).then(() => toast.success('Link copiado'))}
              className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/60 text-sm hover:bg-white/[0.08]">
              Copiar link
            </button>
          )}
        </div>

        {!store && !showCreate ? (
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-10 text-center">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-xl font-bold text-white mb-2">No tenes tienda todavia</h2>
            <p className="text-white/40 mb-6">Crea tu catalogo online en 1 minuto. Tus clientes ven tus productos y te compran por WhatsApp.</p>
            <button onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-bold rounded-xl hover:opacity-90 transition">
              Crear mi tienda
            </button>
          </div>
        ) : showCreate && !store ? (
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-8 max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-white mb-6">Crear tienda</h2>

            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-sm">Nombre de tu tienda</label>
                <input value={storeName} onChange={e => setStoreName(e.target.value)}
                  className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white" />
              </div>

              <div>
                <label className="text-white/60 text-sm">Link de tu tienda</label>
                <div className="flex gap-2 mt-1">
                  <span className="text-white/20 py-2.5">globalservicex.com/tienda/</span>
                  <input value={slug} onChange={e => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSlugOk(null); }}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white" placeholder="doug" />
                  <button onClick={checkSlug} className="px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/60 text-sm">{slugOk === true ? 'Ok' : slugOk === false ? 'No' : '...'}</button>
                </div>
              </div>

              <div>
                <label className="text-white/60 text-sm">Tu WhatsApp (con codigo de pais)</label>
                <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                  className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white" placeholder="584141234567" />
              </div>

              <div>
                <label className="text-white/60 text-sm">Descripcion (opcional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                  className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white resize-none" />
              </div>

              <button onClick={handleCreate} disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-bold rounded-xl hover:opacity-90 disabled:opacity-50">
                {saving ? 'Creando...' : 'Crear tienda'}
              </button>
              <button onClick={() => setShowCreate(false)} className="w-full py-2 text-white/40 text-sm hover:text-white/60">Cancelar</button>
            </div>
          </div>
        ) : store ? (
          <div className="space-y-6">
            {/* Preview + Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Informacion</h3>
                <div className="space-y-3">
                  <input value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm" placeholder="Nombre" />
                  <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm" placeholder="WhatsApp" />
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm resize-none" placeholder="Descripcion" />
                  <input value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm" placeholder="URL de la foto de portada" />
                  <button onClick={handleUpdateInfo} className="w-full py-2.5 bg-[#E5C158] text-black font-semibold rounded-lg text-sm">Guardar cambios</button>
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.04]">
                  <div className="text-white/60 text-xs mb-1">Tu link</div>
                  <code className="text-[#E5C158] text-sm break-all">{storeUrl}</code>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-white/40 text-sm">{store.is_active ? 'Tienda activa' : 'Tienda pausada'}</span>
                  <button onClick={handleToggleActive}
                    className={`relative w-11 h-6 rounded-full transition-colors ${store.is_active ? 'bg-[#25D366]' : 'bg-white/[0.08]'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${store.is_active ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>

              {/* Colors */}
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Tema de colores</h3>
                <div className="grid grid-cols-4 gap-2">
                  {COLORS.map((c, i) => (
                    <button key={c.name} onClick={() => handleUpdateColors(c, i)}
                      className={`p-3 rounded-xl border-2 transition ${i === selectedPalette ? 'border-[#E5C158]' : 'border-transparent hover:border-white/[0.1]'}`}
                      style={{ backgroundColor: c.primary }}>
                      <div className="w-full h-6 rounded mb-2" style={{ backgroundColor: c.accent }} />
                      <div className="text-xs" style={{ color: c.text }}>{c.name}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: customColors.primary }}>
                  <div className="text-sm font-bold" style={{ color: customColors.accent }}>Vista previa</div>
                  <div className="text-xs mt-1" style={{ color: customColors.text }}>Asi se vera tu tienda</div>
                  <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: customColors.card }}>
                    <div className="text-xs" style={{ color: customColors.text }}>Producto $100</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Productos ({products.length})</h3>
                <button onClick={() => { setShowProduct(true); setEditingProduct(null); setProdForm({ name: '', price: '', description: '', image_url: '', category: 'General' }); }}
                  className="px-4 py-2 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black text-sm font-semibold rounded-lg">
                  + Agregar
                </button>
              </div>

              {showProduct && (
                <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-5 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input placeholder="Nombre *" value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm" />
                    <input placeholder="Precio *" type="number" value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm" />
                    <input placeholder="URL de imagen" value={prodForm.image_url} onChange={e => setProdForm({...prodForm, image_url: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm" />
                    <input placeholder="Categoria" value={prodForm.category} onChange={e => setProdForm({...prodForm, category: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm" />
                    <input placeholder="Descripcion" value={prodForm.description} onChange={e => setProdForm({...prodForm, description: e.target.value})} className="md:col-span-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleSaveProduct} className="px-4 py-2 bg-[#E5C158] text-black rounded-lg text-sm font-semibold">{editingProduct ? 'Actualizar' : 'Guardar'}</button>
                    <button onClick={() => { setShowProduct(false); setEditingProduct(null); }} className="px-4 py-2 bg-white/[0.04] text-white/60 rounded-lg text-sm">Cancelar</button>
                  </div>
                </div>
              )}

              {products.length === 0 ? (
                <p className="text-white/30 text-center py-8">No tenes productos. Agrega el primero.</p>
              ) : (
                <div className="space-y-2">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-white/[0.01] rounded-lg">
                      <div className="w-12 h-12 rounded-lg bg-white/[0.04] flex-shrink-0 overflow-hidden">
                        {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/10 text-lg">📦</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{p.name}</div>
                        <div className="text-white/40 text-xs">{p.category} · ${p.price}</div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => editProduct(p)} className="px-3 py-1.5 bg-white/[0.04] text-white/50 text-xs rounded hover:text-white/70">Editar</button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs rounded hover:bg-red-500/20">X</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
