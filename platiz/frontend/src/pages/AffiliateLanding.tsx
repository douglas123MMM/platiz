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

  const getVideoSrc = (url: string) => {
    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return { type: 'iframe', src: `https://www.youtube.com/embed/${id}` };
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return { type: 'iframe', src: `https://www.youtube.com/embed/${id}` };
    }
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      return { type: 'iframe', src: `https://player.vimeo.com/video/${id}` };
    }
    // Google Drive - iframe con /preview (unico modo fiable)
    if (url.includes('drive.google.com/file/d/')) {
      const id = url.match(/\/d\/([^/]+)/)?.[1];
      return { type: 'iframe', src: `https://drive.google.com/file/d/${id}/preview` };
    }
    if (url.includes('drive.google.com/open?id=')) {
      const id = url.split('id=')[1]?.split('&')[0];
      return { type: 'iframe', src: `https://drive.google.com/file/d/${id}/preview` };
    }
    // MP4 o M3U8 directo
    if (url.endsWith('.mp4') || url.endsWith('.m3u8') || url.endsWith('.webm')) {
      return { type: 'video', src: url };
    }
    // Otros URLs como iframe
    return { type: 'iframe', src: url };
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
        <div className="max-w-2xl mx-auto px-0 md:px-4 mb-8">
          {(() => {
            const vs = getVideoSrc(page.video_url);
            const isDrive = page.video_url.includes('drive.google.com');

            if (vs.type === 'video') {
              return (
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <video controls playsInline className="absolute inset-0 w-full h-full rounded-xl bg-black object-contain"
                    controlsList="nodownload nofullscreen" disablePictureInPicture>
                    <source src={vs.src} />
                  </video>
                </div>
              );
            }

            return (
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={isDrive ? `${vs.src}?rm=minimal` : vs.src}
                  className="absolute inset-0 w-full h-full rounded-xl border-0"
                  allowFullScreen={!isDrive}
                  allow="autoplay; encrypted-media"
                  title="Video"
                />
              </div>
            );
          })()}
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
          <div className="flex justify-center gap-3 mt-3">
            {affiliate.whatsapp && (
              <a href={`https://wa.me/${affiliate.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white text-xs rounded-full font-bold hover:bg-[#1ebc5a] transition-colors shadow-lg shadow-[#25D366]/20">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            )}
            {affiliate.telegram_link && (
              <a href={affiliate.telegram_link.startsWith('http') ? affiliate.telegram_link : `https://t.me/${affiliate.telegram_link.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0088cc] text-white text-xs rounded-full font-bold hover:bg-[#0077b3] transition-colors shadow-lg shadow-[#0088cc]/20">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.938z"/></svg>
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
              <form onSubmit={handleRegister} className="space-y-3" autoComplete="off">
                {msg && (
                  <p className={`text-sm text-center p-2 rounded-lg ${msg.includes('Error') || msg.includes('existe') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{msg}</p>
                )}
                <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700]/30"
                  placeholder="Nombre de usuario" value={form.username} autoComplete="off"
                  onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                <input type="email" className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700]/30"
                  placeholder="Correo electronico" value={form.email} autoComplete="off"
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <input type="password" className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700]/30"
                  placeholder="Contrasena" value={form.password} autoComplete="new-password"
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700]/30"
                  placeholder="Telefono" value={form.phone} autoComplete="off"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
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
