import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/Logo';
import { Banner, Category, Stream } from '../types';
import { HiArrowRight, HiFilm, HiPlay } from 'react-icons/hi';
import { IconMovies, IconCourses, IconBooks, IconApps, IconTelegram, IconServices, IconAcademy, IconAffiliate, IconChat, IconLightning, IconStar, IconShield, IconGlobe } from '../icons/PremiumIcons';

const iconMap: Record<string, any> = { 'movie': IconMovies, 'book': IconCourses, 'books': IconBooks, 'app': IconApps, 'telegram': IconTelegram, 'tools': IconServices, 'school': IconAcademy, 'link': IconAffiliate };

const featureItems = [
  { title: 'Acceso Vitalicio', desc: 'Un solo pago para toda la vida. Sin mensualidades ni renovaciones.', icon: IconStar },
  { title: '80% Comisión Directa', desc: 'Gana el 80% por cada venta del acceso vitalicio al sistema.', icon: IconLightning },
  { title: 'Soporte VIP 24/7', desc: 'Asistencia directa y personalizada cuando la necesites.', icon: IconShield },
  { title: 'Actualizaciones Perpetuas', desc: 'Acceso gratuito a cada nuevo servicio que se anexe al sistema.', icon: IconGlobe },
];

export default function DashboardHome() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentStream, setCurrentStream] = useState(0);

  useEffect(() => {
    api.get('/banners').then((r) => setBanners(r.data)).catch(() => {});
    api.get('/content/categories').then((r) => setCategories(r.data)).catch(() => {});
    api.get('/streams').then((r) => setStreams(r.data.filter((s: Stream) => s.active))).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrentBanner((prev) => (prev + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const sectionLinks: Record<string, string> = {
    'movies': '/movies', 'courses': '/courses', 'books': '/books', 'apps': '/apps', 'telegram': '/telegram', 'services': '/services', 'academy': '/academy', 'affiliate': '/affiliate',
  };

  return (
    <div className="space-y-16 animate-fade-in">

      <section className="relative text-center py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cyber-grid pointer-events-none" />
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-[#00D4FF]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-[#A855F7]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <Logo size={56} className="mx-auto mb-6 drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]" />
          <p className="text-2xl md:text-3xl font-light text-[#FFD700]/80 tracking-wide mb-4">
            TRANSFORMA EL INTERNET EN DINERO
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Ecosistema digital de alta gama con acceso vitalicio. Capacitación en viralidad, 
            arsenal de software premium y oportunidades reales de ingresos.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link to="/courses" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
              Comenzar ahora <HiArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/services" className="btn-secondary text-lg px-8 py-4 inline-flex items-center gap-2">
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {featureItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="card text-center group">
              <Icon className="w-8 h-8 text-[#FFD700] mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
              <p className="text-gray-500 text-xs">{item.desc}</p>
            </div>
          );
        })}
      </section>

      {banners.length > 0 && (
        <section className="relative overflow-hidden rounded-3xl glass border border-[#FFD700]/10">
          <div className="relative h-[300px] md:h-[420px]">
            {banners.map((banner, i) => (
              <div key={banner.id} className={`absolute inset-0 transition-all duration-700 ${i === currentBanner ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
                {banner.image_url ? (
                  <img src={banner.image_url} alt={banner.title} className="w-full h-full object-contain p-4 bg-[#0a0a0f]" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0a0a0f] via-[#111] to-[#DAA520]/10 flex items-center justify-center">
                    <p className="text-4xl md:text-6xl font-display font-bold text-[#FFD700]/20">{banner.title}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  {banner.link ? (
                    <a href={banner.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white font-semibold text-lg hover:text-[#FFD700] transition-colors group">
                      {banner.title}
                      <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  ) : <h2 className="text-white font-semibold text-lg">{banner.title}</h2>}
                  {banner.description && <p className="text-gray-400 text-sm mt-2 max-w-2xl">{banner.description}</p>}
                </div>
              </div>
            ))}
          </div>
          {banners.length > 1 && (
            <div className="absolute bottom-4 right-8 flex gap-2">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setCurrentBanner(i)} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentBanner ? 'w-8 bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.6)]' : 'bg-white/20 hover:bg-white/40'}`} />
              ))}
            </div>
          )}
        </section>
      )}

      {streams.length > 0 && (
        <section>
          <div className="text-center mb-8">
            <h2 className="section-title">Transmisiones en Vivo</h2>
            <p className="section-subtitle">Contenido multimedia desde múltiples plataformas</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-2xl glass border border-[#FFD700]/10">
                <div className="relative" style={{ aspectRatio: '16/9' }}>
                  {streams[currentStream]?.video_url && (
                    <iframe
                      src={(() => {
                        const url = streams[currentStream].video_url;
                        const type = streams[currentStream].video_type;
                        if (type === 'youtube') {
                          const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/);
                          return m ? `https://www.youtube.com/embed/${m[1]}` : url;
                        }
                        if (type === 'vimeo') {
                          const m = url.match(/vimeo\.com\/(\d+)/);
                          return m ? `https://player.vimeo.com/video/${m[1]}` : url;
                        }
                        if (type === 'gdrive') {
                          const m = url.match(/\/d\/([^/]+)/);
                          return m ? `https://drive.google.com/file/d/${m[1]}/preview` : url;
                        }
                        if (type === 'twitch') {
                          const m = url.match(/twitch\.tv\/([^/]+)/);
                          return m ? `https://player.twitch.tv/?channel=${m[1]}&parent=${window.location.hostname}` : url;
                        }
                        return url;
                      })()}
                      title={streams[currentStream]?.title}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0f] to-transparent">
                  <h3 className="text-white font-semibold">{streams[currentStream]?.title}</h3>
                  {streams[currentStream]?.platform && (
                    <span className="badge badge-gold text-xs mt-1">{streams[currentStream].platform}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-3 max-h-[360px] overflow-y-auto">
              {streams.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStream(i)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${i === currentStream ? 'bg-[#FFD700]/10 border border-[#FFD700]/20' : 'glass border border-[#FFD700]/5 hover:bg-[#FFD700]/5'}`}
                >
                  <div className="flex items-center gap-3">
                    {s.thumbnail_url ? (
                      <img src={s.thumbnail_url} alt={s.title} className="w-16 h-10 object-cover rounded-lg flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-10 bg-[#111] rounded-lg flex items-center justify-center flex-shrink-0">
                        <HiPlay className="w-4 h-4 text-[#FFD700]/40" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{s.title}</p>
                      <p className="text-xs text-gray-500">{s.platform || 'Stream'}</p>
                    </div>
                    {i === currentStream && <div className="ml-auto w-2 h-2 rounded-full bg-[#FFD700] shadow-[0_0_6px_rgba(255,215,0,0.8)]" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="text-center mb-10">
          <h2 className="section-title">Explora el Ecosistema</h2>
          <p className="section-subtitle">TODO LO QUE NECESITAS PARA TRANSFORMAR EL INTERNET EN DINERO</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] || HiFilm;
            const link = sectionLinks[cat.slug] || '/';
            return (
              <Link key={cat.id} to={link} className="card-glow group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#FFD700]/15 to-[#DAA520]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-[#FFD700]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{cat.name}</h3>
                  <p className="text-gray-400 text-sm">{cat.description}</p>
                  <div className="flex items-center gap-1 mt-4 text-[#FFD700] text-sm font-medium group-hover:gap-2 transition-all">
                    <span>Explorar</span>
                    <HiArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="glass rounded-3xl p-8 md:p-12 border border-[#FFD700]/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00D4FF]/5 rounded-full blur-3xl" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#DAA520] to-[#B8860B] rounded-2xl flex items-center justify-center text-black text-2xl font-bold mx-auto mb-6 shadow-lg shadow-[#FFD700]/20">
            <IconChat className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold gold-text mb-4">Chat con IA Integrado</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
            Conecta con múltiples proveedores de IA: ChatGPT Plus, Gemini, Perplexity, Claude y más. 
            Todo desde un solo lugar, incluido en tu acceso vitalicio.
          </p>
          <Link to="/chat" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Ir al chat <HiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <section className="text-center py-8 border-t border-[#FFD700]/10">
        <p className="text-[#FFD700]/40 text-xs uppercase tracking-widest font-medium">Global Dorado &mdash; Transforma el Internet en Dinero</p>
        <p className="text-gray-600 text-xs mt-2">Acceso Vitalicio &bull; 80% Comisión &bull; Soporte VIP 24/7</p>
      </section>
    </div>
  );
}
