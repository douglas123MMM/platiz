import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';

interface Affiliate {
  display_name: string;
  avatar: string | null;
  whatsapp: string;
  telegram_link: string;
}

interface PageConfig {
  type: string;
  title: string;
  subtitle: string;
  video_url: string;
  video_type: string;
  text: string;
  bullets: string[];
  price: string;
  cta_text: string;
  show_form: boolean;
}

export default function AffiliateLanding() {
  const { code, pageType } = useParams<{ code: string; pageType?: string }>();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref') || code;
  const type = pageType || 'landing';

  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [page, setPage] = useState<PageConfig | null>(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', phone: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!ref) return;
    api.get(`/affiliate/landing/${ref}/${type}`).then(({ data }) => {
      setAffiliate(data.affiliate);
      setPage(data.page);
    }).catch(() => setMsg('Enlace no valido'));
  }, [ref, type]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const { data } = await api.post('/affiliate/register', { ...form, referral_code: ref });
      if (data.token) {
        localStorage.setItem('token', data.token);
        setRegistered(true);
        setMsg('Registro exitoso. Tu asesor te contactara pronto.');
      }
    } catch (e: any) {
      setMsg(e.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const getVideoEmbed = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
      const id = url.includes('youtu.be/') ? url.split('youtu.be/')[1]?.split('?')[0] : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    if (url.includes('drive.google.com')) {
      const id = url.match(/\/d\/([^/]+)/)?.[1];
      return `https://drive.google.com/file/d/${id}/preview`;
    }
    return url;
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <div className="bg-[#111] border border-[#FFD700]/20 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#FFD700] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Registro Exitoso</h2>
          <p className="text-gray-400 text-sm mb-4">{msg}</p>
          <a href="/dashboard" className="inline-block w-full py-3 bg-[#FFD700] text-black font-bold rounded-xl text-sm">
            Ir al Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-b from-black to-transparent py-6 text-center px-4">
        <h1 className="text-2xl font-bold text-[#FFD700]">{page?.title || 'Global Dorado'}</h1>
        <p className="text-gray-500 text-xs mt-1">{page?.subtitle}</p>
      </div>

      {/* Video */}
      {page?.video_url && (
        <div className="max-w-2xl mx-auto px-4 mb-8">
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            <iframe src={getVideoEmbed(page.video_url) || ''} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" title="Video" />
          </div>
        </div>
      )}

      {/* Affiliate Info */}
      {affiliate && (
        <div className="text-center px-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-[#FFD700]/20 flex items-center justify-center mx-auto mb-2">
            {affiliate.avatar ? (
              <img src={affiliate.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <span className="text-3xl">👤</span>
            )}
          </div>
          <h2 className="text-white font-bold">{affiliate.display_name || 'Global Dorado'}</h2>
          <p className="text-gray-500 text-xs">Tu asesor personal</p>
          {/* Contact buttons */}
          <div className="flex justify-center gap-2 mt-3">
            {affiliate.whatsapp && (
              <a href={`https://wa.me/${affiliate.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="px-4 py-1.5 bg-[#25D366] text-white text-xs rounded-full font-bold hover:bg-[#1ebc5a]">
                WhatsApp
              </a>
            )}
            {affiliate.telegram_link && (
              <a href={affiliate.telegram_link.startsWith('http') ? affiliate.telegram_link : `https://t.me/${affiliate.telegram_link.replace('@', '')}`}
                target="_blank" rel="noopener noreferrer"
                className="px-4 py-1.5 bg-[#0088cc] text-white text-xs rounded-full font-bold hover:bg-[#0077b3]">
                Telegram
              </a>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-md mx-auto px-4 pb-12">
        <div className="bg-[#111] border border-[#FFD700]/10 rounded-2xl p-6">
          {page?.text && (
            <div className="mb-4 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{page.text}</div>
          )}

          {page?.bullets && page.bullets.length > 0 && (
            <div className="space-y-2 mb-6 text-sm text-gray-300">
              {page.bullets.map((b, i) => <p key={i}>• {b}</p>)}
            </div>
          )}

          {page?.price && (
            <div className="bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-xl p-4 mb-6 text-center">
              <p className="text-xs text-gray-400">Inversion</p>
              <p className="text-2xl font-bold text-[#FFD700]">{page.price}</p>
            </div>
          )}

          {page?.show_form !== false && (
            !showForm ? (
              <button onClick={() => setShowForm(true)}
                className="w-full py-3 bg-[#FFD700] text-black font-bold rounded-xl text-sm hover:bg-[#FFE44D] transition-colors">
                {page?.cta_text || 'Quiero Registrarme'}
              </button>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                {msg && (
                  <p className={`text-sm text-center p-2 rounded-lg ${msg.includes('Error') || msg.includes('existe') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{msg}</p>
                )}
                <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700]/30"
                  placeholder="Nombre de usuario" value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                <input type="email" className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700]/30"
                  placeholder="Correo electronico" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <input type="password" className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700]/30"
                  placeholder="Contrasena" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700]/30"
                  placeholder="Telefono (opcional)" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-[#FFD700] text-black font-bold rounded-xl text-sm hover:bg-[#FFE44D] transition-colors disabled:opacity-50">
                  {loading ? 'Registrando...' : 'Registrarme'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="w-full py-2 text-gray-500 text-sm hover:text-gray-300">Cancelar</button>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
}
