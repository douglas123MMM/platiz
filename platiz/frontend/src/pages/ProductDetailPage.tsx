import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

interface Product {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category?: string;
  category_slug?: string;
  price: number;
  delivery_type: string;
  account_type: string;
  duration_days: number;
  vendor_name: string;
  terms: string;
  stock?: number;
  renewable?: boolean;
  link?: string;
  video_url?: string;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [affiliate, setAffiliate] = useState<{ display_name: string; avatar: string | null; whatsapp: string; telegram_link: string } | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'desc' | 'guide' | 'warranty'>('desc');
  const [selectedPlan, setSelectedPlan] = useState(0);

  useEffect(() => {
    if (!id) return;
    api.get(`/affiliate/product/${id}`).then(({ data }) => setProduct(data)).catch(() => {});
    // Get affiliate info from localStorage or query param
    const code = new URLSearchParams(window.location.search).get('ref');
    if (code) {
      api.get(`/affiliate/landing/${code}/landing`).then(({ data }: any) => {
        if (data.affiliate) setAffiliate(data.affiliate);
      }).catch(() => {});
    }
    // Related products
    api.get('/affiliate/catalog').then(({ data }: any) => {
      const filtered = (data || []).filter((p: any) => p.id !== id).slice(0, 4);
      setRelated(filtered);
    }).catch(() => {});
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
      </div>
    );
  }

  const whatsappMsg = affiliate?.whatsapp
    ? `https://wa.me/${affiliate.whatsapp.replace(/\D/g, '')}?text=Hola!%20Quiero%20adquirir%20${encodeURIComponent(product.title)}%20por%20%24${product.price.toFixed(2)}`
    : '#';

  const cat = product.category || product.category_slug || '';
  const plans = product.price > 0 ? [
    { label: `${product.duration_days > 0 ? product.duration_days + ' DIAS' : 'ACCESO'}`, price: product.price }
  ] : [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#FFD700]">Inicio</Link>
          <span>/</span>
          <Link to={`/catalogo/${new URLSearchParams(window.location.search).get('ref') || ''}`} className="hover:text-[#FFD700]">Catalogo</Link>
          <span>/</span>
          <span className="text-gray-400 truncate">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/5">
            {product.image_url ? (
              <img src={product.image_url} alt={product.title} className="w-full h-full object-contain p-4" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl font-black text-white/5">{product.title.charAt(0)}</div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <span className="inline-flex self-start px-3 py-1 rounded-full text-xs font-medium bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 mb-3">
              {cat === 'movies' || cat === 'Streaming' ? '📺 Streaming' : cat}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{product.title}</h1>

            {/* Plans */}
            {plans.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Selecciona tu plan:</p>
                <div className="space-y-2">
                  {plans.map((plan, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPlan(i)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        selectedPlan === i
                          ? 'border-[#FFD700] bg-[#FFD700]/5'
                          : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <span className="font-medium">{plan.label}</span>
                      <span className="text-lg font-bold text-[#FFD700]">${plan.price.toFixed(2)} <span className="text-xs text-gray-500">USDT</span></span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price & Stock */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
              <div>
                <span className="text-sm text-gray-400">Precio</span>
                <div className="text-2xl font-bold text-[#FFD700]">${product.price.toFixed(2)} <span className="text-sm text-gray-500">USDT</span></div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {product.stock != null && product.stock > 0 ? 'En stock' : 'En stock'}
                </div>
                <span className="text-xs text-gray-500">
                  {product.delivery_type === 'automatica' ? 'Entrega instantanea' : 'Entrega pendiente'}
                </span>
              </div>
            </div>

            {/* Buy Button */}
            <a
              href={whatsappMsg}
              target="_blank" rel="noopener noreferrer"
              className="w-full text-center py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-500 hover:to-emerald-500 active:scale-[0.98] transition-all shadow-lg shadow-green-600/20"
            >
              Comprar — ${product.price.toFixed(2)} USDT
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10">
          <div className="flex gap-0 border-b border-white/5">
            {(['desc', 'guide', 'warranty'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-[#FFD700] border-b-2 border-[#FFD700]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab === 'desc' ? 'Descripcion' : tab === 'guide' ? 'Guia de Uso' : 'Garantia'}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === 'desc' && (
              <div className="space-y-4">
                {product.description && (
                  <>
                    <p className="text-gray-300 whitespace-pre-wrap">{product.description}</p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                    <span className="text-emerald-400 text-xs font-medium">Licencia 100% original</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/10 text-center">
                    <span className="text-[#FFD700] text-xs font-medium">Soporte 24/7 incluido</span>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-center">
                    <span className="text-blue-400 text-xs font-medium">Pago seguro con Binance</span>
                  </div>
                </div>
                  </>
                )}
                {!product.description && <p className="text-gray-500">Sin descripcion disponible.</p>}
              </div>
            )}
            {activeTab === 'guide' && (
              <div className="text-gray-300 space-y-3">
                <div className="p-4 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/10">
                  <h3 className="text-[#FFD700] font-semibold mb-2">Como usar tu {product.category || 'servicio'}</h3>
                  <ol className="list-decimal pl-5 space-y-1.5 text-sm">
                    <li>Recibe los datos de acceso en tu WhatsApp o email</li>
                    <li>Descarga la aplicacion oficial desde la tienda de tu dispositivo</li>
                    <li>Inicia sesion con el usuario y contrasena proporcionados</li>
                    <li>Selecciona el perfil asignado (si aplica)</li>
                    <li>Disfruta del servicio durante el periodo contratado</li>
                  </ol>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[#FFD700] text-xs font-medium">✅ Cuenta original</span>
                    <p className="text-gray-500 text-xs mt-1">Licencia 100% verificada</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[#FFD700] text-xs font-medium">✅ Soporte 24/7</span>
                    <p className="text-gray-500 text-xs mt-1">Asistencia via WhatsApp</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[#FFD700] text-xs font-medium">✅ Entrega inmediata</span>
                    <p className="text-gray-500 text-xs mt-1">Datos enviados al instante</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[#FFD700] text-xs font-medium">✅ Multi-dispositivo</span>
                    <p className="text-gray-500 text-xs mt-1">Compatible con TV, PC y movil</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'warranty' && (
              <div className="text-gray-300 space-y-3">
                <p>✅ Garantia de reemplazo durante todo el periodo contratado</p>
                <p>✅ Si el servicio falla, contactanos y te damos una cuenta nueva</p>
                <p>✅ Soporte tecnico incluido para ayudarte con la configuracion</p>
                <p>✅ Todos los pagos quedan registrados con un ID unico de referencia</p>
                <p>✅ Tiempo de respuesta: menos de 24 horas</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Productos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p: any) => (
                <Link
                  key={p.id}
                  to={`/producto/${p.id}${window.location.search}`}
                  className="group rounded-xl overflow-hidden border border-white/5 hover:border-[#FFD700]/20 bg-[#111] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <span className="text-4xl font-black text-white/10">{p.title.charAt(0)}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] text-gray-500">{p.category || p.category_slug}</span>
                    <p className="text-xs font-medium text-white line-clamp-2 mt-1">{p.title}</p>
                    {p.price > 0 && <p className="text-[#FFD700] text-sm font-bold mt-1">${p.price.toFixed(2)} USDT</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
