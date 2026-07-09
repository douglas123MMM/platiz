import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

interface Store {
  store_name: string; description: string; slug: string;
  logo_url: string; whatsapp: string;
  primary_color: string; accent_color: string; text_color: string; card_color: string;
}

interface Product {
  id: string; name: string; description: string;
  price: number; image_url: string; category: string;
}

const CATEGORIES = ['General', 'Ropa', 'Tecnologia', 'Hogar', 'Deportes', 'Belleza', 'Alimentos', 'Servicios'];

export default function PublicStore() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedCat, setSelectedCat] = useState('Todos');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [storeRes, prodRes] = await Promise.all([
          api.get(`/storefront/public/${slug}`),
          api.get(`/storefront/public/${slug}/products`)
        ]);
        setStore(storeRes.data);
        setProducts(prodRes.data || []);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#25D366]/30 border-t-[#25D366] rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-2">Tienda no encontrada</h1>
        <p className="text-white/40">Este link no existe o la tienda esta pausada.</p>
      </div>
    );
  }

  const categories = ['Todos', ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = products.filter(p => {
    if (selectedCat !== 'Todos' && p.category !== selectedCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const whatsappLink = store.whatsapp
    ? `https://wa.me/${store.whatsapp}?text=Hola%20vi%20tu%20tienda%20${store.store_name}%20y%20quiero%20comprar`
    : '#';

  return (
    <div style={{ backgroundColor: store.primary_color, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto p-4 pb-24">

        {/* Header */}
        <div className="text-center py-6">
          {store.logo_url && <img src={store.logo_url} alt="" className="h-16 mx-auto mb-3 rounded-xl" />}
          <h1 className="text-2xl font-bold" style={{ color: store.text_color }}>{store.store_name}</h1>
          {store.description && <p className="mt-1 text-sm opacity-60" style={{ color: store.text_color }}>{store.description}</p>}
          <div className="mt-3">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-medium text-sm"
              style={{ backgroundColor: store.accent_color }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              Pedir por WhatsApp
            </a>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm border"
            style={{
              backgroundColor: store.card_color,
              borderColor: store.accent_color + '20',
              color: store.text_color
            }}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCat(cat)}
              className="px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition font-medium"
              style={{
                backgroundColor: selectedCat === cat ? store.accent_color : store.card_color,
                color: selectedCat === cat ? '#000' : store.text_color,
                opacity: selectedCat === cat ? 1 : 0.6
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Products */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📦</div>
            <p style={{ color: store.text_color, opacity: 0.4 }}>
              {search ? 'Sin resultados' : 'No hay productos todavia'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(p => (
              <div key={p.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: store.card_color }}>
                <div className="aspect-square bg-white/[0.02] flex items-center justify-center overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-4xl opacity-20">📦</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium truncate" style={{ color: store.text_color }}>{p.name}</div>
                  {p.description && (
                    <div className="text-xs mt-0.5 truncate" style={{ color: store.text_color, opacity: 0.5 }}>{p.description}</div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-base font-bold" style={{ color: store.accent_color }}>${p.price}</span>
                    <a href={`https://wa.me/${store.whatsapp}?text=Quiero%20comprar:%20${encodeURIComponent(p.name)}%20($${p.price})`} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: store.accent_color + '30' }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: store.accent_color }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pb-6">
          <p className="text-xs" style={{ color: store.text_color, opacity: 0.2 }}>
            Creado con Global Dorado
          </p>
        </div>
      </div>

      {/* Fixed WhatsApp button */}
      <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
        style={{ backgroundColor: '#25D366' }}>
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
      </a>
    </div>
  );
}
