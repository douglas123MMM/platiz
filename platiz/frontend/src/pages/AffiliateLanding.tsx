import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { IconCheckCircle, IconUsers, IconStar, IconShield, IconLightning } from '../icons/PremiumIcons';

interface Affiliate {
  display_name: string;
  avatar: string | null;
  whatsapp: string;
  telegram_link: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  youtube?: string;
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

const benefits = [
  { icon: IconStar, text: 'Acceso Vitalicio de por Vida' },
  { icon: IconLightning, text: '80% de Comision Directa' },
  { icon: IconShield, text: 'Soporte Garantizado' },
  { icon: IconUsers, text: 'Comunidad de +2600 Socios' },
];

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
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (!ref) return;
    api.get(`/affiliate/landing/${ref}/${type}`).then(({ data }) => {
      setAffiliate(data.affiliate);
      setPage(data.page);
    }).catch(() => setMsg('Enlace no valido'));
  }, [ref, type]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      const { data } = await api.post('/affiliate/register', { ...form, referral_code: ref });
      if (data.token) { setRegistered(true); setMsg('Registro exitoso. Tu asesor te contactara pronto.'); }
    } catch (e: any) { setMsg(e.response?.data?.error || 'Error al registrarse'); }
    finally { setLoading(false); }
  };

  const getVideoSrc = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) { const id = url.split('v=')[1]?.split('&')[0]; return { type: 'iframe', src: `https://www.youtube.com/embed/${id}` }; }
    if (url.includes('youtu.be/')) { const id = url.split('youtu.be/')[1]?.split('?')[0]; return { type: 'iframe', src: `https://www.youtube.com/embed/${id}` }; }
    if (url.includes('vimeo.com/')) { const id = url.split('vimeo.com/')[1]?.split('?')[0]; return { type: 'iframe', src: `https://player.vimeo.com/video/${id}` }; }
    if (url.includes('drive.google.com')) { const encoded = encodeURIComponent(url); return { type: 'video', src: `/api/video/stream?url=${encoded}` }; }
    return { type: 'video', src: url };
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center border-[#E5C158]/20">
          <div className="w-16 h-16 rounded-full bg-[#E5C158] flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
            <IconCheckCircle className="text-[#0a0a0f]" size={40} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Registro Exitoso</h2>
          <p className="text-gray-300 text-sm mb-4">{msg}</p>
          <a href="/dashboard" className="inline-block w-full py-3 bg-[#E5C158] text-black font-bold rounded-xl text-sm hover:bg-[#F0D78C] transition-colors">
            Ir al Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <div className="relative text-center pt-12 pb-8 px-4 overflow-hidden bg-gradient-to-b from-[#0d0d1a] to-[#0a0a0f] border-b border-[#E5C158]/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.05),transparent_60%)]" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold gold-text mb-2">{page?.title || 'Global Dorado'}</h1>
          <p className="text-gray-300 text-sm">{page?.subtitle}</p>
        </div>
      </div>

      {/* Video */}
      {page?.video_url && (
        <div className="max-w-2xl mx-auto px-4 -mt-4 mb-6 relative z-10">
          <div className="rounded-2xl overflow-hidden border border-[#E5C158]/10 shadow-2xl shadow-black/30">
            {(() => {
              const vs = getVideoSrc(page.video_url);
              if (vs.type === 'video') {
                return (
                  <video controls playsInline className="w-full aspect-video bg-black" controlsList="nodownload" disablePictureInPicture
                    onError={() => setVideoError(true)} onLoadedData={() => setVideoError(false)}>
                    <source src={vs.src} type="video/mp4" />
                  </video>
                );
              }
              return (
                <div className="w-full aspect-video bg-black">
                  <iframe src={vs.src} className="w-full h-full border-0" allow="autoplay; encrypted-media; fullscreen" allowFullScreen title="Video" />
                </div>
              );
            })()}
          </div>
          {videoError && <p className="text-red-400 text-xs text-center mt-2">Error al cargar el video.</p>}
        </div>
      )}

      {/* Affiliate Card */}
      {affiliate && (
        <div className="max-w-md mx-auto px-4 mb-8">
          <div className="glass rounded-2xl p-6 text-center border-[#E5C158]/10">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E5C158]/20 to-[#C4A44A]/10 flex items-center justify-center mx-auto mb-3 ring-2 ring-[#E5C158]/20 ring-offset-2 ring-offset-[#0a0a0f]">
                {affiliate.avatar ? (
                  <img src={affiliate.avatar} alt="" className="w-20 h-20 rounded-full object-cover" loading="lazy" />
                ) : (
                  <IconUsers className="text-[#E5C158]" size={36} />
                )}
              </div>
            </div>
            <h2 className="text-white font-bold text-lg">{affiliate.display_name || 'Global Dorado'}</h2>
            <p className="text-[#E5C158]/80 text-xs">Tu asesor personal</p>

            {/* Contact buttons */}
            <div className="flex justify-center gap-2 mt-4">
              {affiliate.whatsapp && (
                <a href={`https://wa.me/${affiliate.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-[#25D366] text-white text-sm rounded-xl font-bold hover:bg-[#1ebc5a] transition-colors shadow-lg shadow-[#25D366]/20">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              )}
              {affiliate.telegram_link && (
                <a href={affiliate.telegram_link.startsWith('http') ? affiliate.telegram_link : `https://t.me/${affiliate.telegram_link.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0088cc] text-white text-sm rounded-xl font-bold hover:bg-[#0077b3] transition-colors shadow-lg shadow-[#0088cc]/20">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.938z"/></svg>
                  Telegram
                </a>
              )}
            </div>

            {/* Social icons */}
            {(affiliate.instagram || affiliate.tiktok || affiliate.facebook || affiliate.youtube) && (
              <div className="flex justify-center gap-2 mt-3">
                {affiliate.instagram && <SocialIcon platform="instagram" val={affiliate.instagram} />}
                {affiliate.tiktok && <SocialIcon platform="tiktok" val={affiliate.tiktok} />}
                {affiliate.facebook && <SocialIcon platform="facebook" val={affiliate.facebook} />}
                {affiliate.youtube && <SocialIcon platform="youtube" val={affiliate.youtube} />}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Card */}
      <div className="max-w-md mx-auto px-4 pb-16">
        <div className="glass rounded-2xl p-6 border-[#E5C158]/10">
          {page?.text && (
            <p className="mb-5 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{page.text}</p>
          )}

          {page?.bullets && page.bullets.length > 0 && (
            <div className="space-y-3 mb-6">
              {page.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E5C158]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E5C158" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="text-sm text-gray-300">{b}</span>
                </div>
              ))}
            </div>
          )}

          {page?.price && (
            <div className="bg-gradient-to-br from-[#E5C158]/5 to-[#C4A44A]/5 border border-[#E5C158]/10 rounded-2xl p-5 mb-6 text-center">
              <p className="text-xs text-gray-300 mb-1 uppercase tracking-wider">Inversion</p>
              <p className="text-3xl font-extrabold gold-text">{page.price}</p>
            </div>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                  <Icon className="w-4 h-4 text-[#E5C158]/80 flex-shrink-0" />
                  <span className="text-[10px] text-gray-300 leading-tight">{b.text}</span>
                </div>
              );
            })}
          </div>

          {page?.show_form !== false && (
            !showForm ? (
              <button onClick={() => setShowForm(true)}
                className="w-full py-3.5 bg-gradient-to-r from-[#C4A44A] via-[#E5C158] to-[#A6842C] text-black font-bold rounded-xl text-sm hover:from-[#E5C158] hover:via-[#FDF8EC] hover:to-[#C4A44A] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(255,215,0,0.4)] transition-all duration-200">
                {page?.cta_text || 'Quiero Registrarme'}
              </button>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3" autoComplete="off">
                {msg && (
                  <p className={`text-sm text-center p-2 rounded-lg ${msg.includes('Error') || msg.includes('existe') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{msg}</p>
                )}
                <input className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#E5C158]/30 transition-colors"
                  placeholder="Nombre de usuario" value={form.username} autoComplete="off"
                  onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                <input type="email" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#E5C158]/30 transition-colors"
                  placeholder="Correo electronico" value={form.email} autoComplete="off"
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <input type="password" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#E5C158]/30 transition-colors"
                  placeholder="Contrasena" value={form.password} autoComplete="new-password"
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <input className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#E5C158]/30 transition-colors"
                  placeholder="Telefono" value={form.phone} autoComplete="off"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#C4A44A] via-[#E5C158] to-[#A6842C] text-black font-bold rounded-xl text-sm hover:from-[#E5C158] hover:via-[#FDF8EC] hover:to-[#C4A44A] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50">
                  {loading ? 'Registrando...' : 'Registrarme'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="w-full py-2 text-gray-300 text-sm hover:text-gray-300 transition-colors">Cancelar</button>
              </form>
            )
          )}
        </div>

        {/* Footer branding */}
        <p className="text-center text-[#E5C158]/20 text-[10px] mt-6 uppercase tracking-widest">Global Dorado — Transforma el Internet en Dinero</p>
      </div>
    </motion.div>
  );
}

function SocialIcon({ platform, val }: { platform: string; val: string }) {
  const getUrl = () => {
    if (val.startsWith('http')) return val;
    const u = val.replace('@', '');
    const bases: Record<string, string> = { instagram: 'instagram.com', tiktok: 'tiktok.com/@', facebook: 'facebook.com', youtube: 'youtube.com/' };
    return 'https://' + (bases[platform] || '') + u;
  };
  const colors: Record<string, string> = {
    instagram: 'bg-gradient-to-br from-[#833AB4] to-[#E1306C]',
    tiktok: 'bg-black border border-white/20',
    facebook: 'bg-[#1877F2]',
    youtube: 'bg-[#FF0000]',
  };
  return (
    <a href={getUrl()} target="_blank" rel="noopener noreferrer"
      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform ${colors[platform] || 'bg-white/10'}`}>
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d={platform === 'instagram' ? "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" : platform === 'facebook' ? "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" : platform === 'youtube' ? "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" : "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"} /></svg>
    </a>
  );
}
