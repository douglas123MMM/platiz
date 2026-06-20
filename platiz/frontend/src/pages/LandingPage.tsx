import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import FloatingButtons from '../components/FloatingButtons';
import { IconArrowRight, IconChevronDown, IconPlay, IconLightning, IconStar, IconShield, IconGlobe, IconCheck } from '../icons/PremiumIcons';
import { SectionStreaming, SectionBooks, SectionApps, SectionTelegram, SectionServices, SectionAcademy, SectionAffiliate, IconCourses, IconChat, IconEducation, IconTools, IconRobot, IconVideo, IconUsers } from '../icons/PremiumIcons';

const features = [
  { title: '80% Comisión Directa', desc: 'Gana el 80% por cada venta del acceso vitalicio al sistema.', icon: IconLightning },
  { title: 'Acceso Vitalicio', desc: 'Un solo pago para toda la vida. Sin mensualidades ni cuotas ocultas.', icon: IconStar },
  { title: 'Soporte VIP 24/7', desc: 'Asistencia directa y personalizada cuando la necesites, sin límites.', icon: IconShield },
  { title: 'Actualizaciones Perpetuas', desc: 'Acceso gratuito a cada nuevo servicio que se anexe al sistema.', icon: IconGlobe },
];

const categories = [
  { icon: SectionStreaming, title: 'Entretenimiento', desc: 'Netflix, Disney+, Spotify, YouTube Premium, gaming y más' },
  { icon: IconCourses, title: 'Capacitación', desc: 'Cursos de viralidad orgánica, estrategias de venta y cierre' },
  { icon: SectionBooks, title: 'Libros', desc: 'Biblioteca digital con libros de desarrollo personal y negocios' },
  { icon: SectionApps, title: 'Aplicaciones', desc: 'Apps móviles y web para potenciar tu productividad' },
  { icon: SectionTelegram, title: 'Comunidad Telegram', desc: 'Canales VIP con soporte 24/7 y contenido exclusivo' },
  { icon: SectionServices, title: 'Arsenal Digital', desc: 'Office 365, Adobe, Solidworks, AutoCAD, ChatGPT Plus y más' },
  { icon: SectionAcademy, title: 'Academia Global', desc: 'El Método: capacitación maestra para tu negocio digital' },
  { icon: SectionAffiliate, title: 'Afiliación', desc: 'Instrucciones y enlaces para promover Global Dorado' },
];

const arsenalItems = [
  'Office 365 Premium / Personal / Pro', 'Windows 10 & 11 Pro', 'Adobe Creative Cloud 1 año',
  'AutoCAD, Civil 3D, Revit, Inventor', 'Solidworks 2016-2024', 'SketchUp 2021-2025',
  'ChatGPT Plus', 'Gemini IA', 'Perplexity Pro', 'Netflix, Disney+, MAX, YouTube Premium',
  'Spotify Premium, Apple Music, Tidal', 'CapCut Pro, Canva Pro',
  'Eset Nod32 / Internet Security', 'CorelDraw 2021-2025', 'Photoshop e Illustrator',
  'Nitro PDF 14 Pro', 'Camtasia, Filmora', 'PlayStation 4/5, Nintendo Switch',
];

export default function LandingPage() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fadeIn = prefersReducedMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.8 } };
  const reveal = prefersReducedMotion ? {} : { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-100px" }, transition: { duration: 0.6 } };
  const [partners, setPartners] = useState<any[]>([]);
  const [landingVideos, setLandingVideos] = useState<any[]>([]);

  useEffect(() => {
    api.get('/partners/active').then((r) => setPartners(r.data)).catch(() => {});
    api.get('/partners/landing-videos').then((r) => setLandingVideos(r.data)).catch(() => {});
  }, []);

  return (
    <div className="bg-[#0a0a0f] text-white overflow-hidden">
      {/* Hero */}
      <motion.section {...fadeIn} className="relative min-h-screen flex items-center justify-center pt-16 pb-8 md:pb-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,180,255,0.04),transparent_50%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FFD700]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-64" style={{background:'linear-gradient(to top,#0a0a0f,transparent)'}} />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <Logo size={72} className="mx-auto mb-8 drop-shadow-[0_0_30px_rgba(255,215,0,0.4)] animate-float" />

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight gold-text mb-6 leading-[1.1] animate-fade-in" style={{textShadow:'0 2px 40px rgba(255,215,0,0.15)'}}>
            Global Dorado
          </h1>

          <p className="text-xl md:text-3xl lg:text-4xl font-light text-[#FFD700]/80 tracking-[0.3em] md:tracking-[0.5em] uppercase mb-6 animate-slide-up">
            Transforma el Internet en Dinero
          </p>

          <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed mb-10 animate-slide-up">
            Ecosistema digital de alta gama con acceso vitalicio. Capacitación especializada en viralidad, el arsenal de software y servicios digitales más completo del mercado, y oportunidades reales de ingresos como promotor.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link to="/register" className="group inline-flex items-center gap-2 px-10 py-4 bg-[#FFD700] text-black font-bold rounded-2xl text-lg hover:bg-[#FFE44D] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_24px_rgba(255,215,0,0.25)] hover:shadow-[0_6px_32px_rgba(255,215,0,0.35)] min-h-[56px]">
              Comenzar ahora
              <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button onClick={() => scrollTo('info')} className="group inline-flex items-center gap-2 px-10 py-4 border border-white/10 text-gray-300 font-semibold rounded-2xl text-lg hover:bg-white/5 hover:border-white/20 hover:text-white active:scale-[0.98] transition-all duration-200 backdrop-blur-sm min-h-[56px]">
              Conocer más
              <IconChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-400 animate-fade-in">
            <span className="flex items-center gap-2"><IconCheck className="w-4 h-4 text-[#FFD700]" /> Acceso Vitalicio</span>
            <span className="flex items-center gap-2"><IconCheck className="w-4 h-4 text-[#FFD700]" /> 80% Comisión</span>
            <span className="flex items-center gap-2"><IconCheck className="w-4 h-4 text-[#FFD700]" /> Soporte 24/7</span>
          </div>

          {landingVideos.length > 0 && (
            <div className="mt-10 md:mt-14 w-full max-w-3xl mx-auto animate-slide-up px-2 md:px-0">
              <div className="rounded-2xl overflow-hidden border border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
                <div className="relative aspect-video">
                  <iframe
                    src={(() => {
                      const v = landingVideos[0];
                      if (v.video_type === 'youtube') {
                        const id = v.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/);
                        return id ? `https://www.youtube.com/embed/${id[1]}` : v.video_url;
                      }
                      if (v.video_type === 'vimeo') {
                        const id = v.video_url.match(/vimeo\.com\/(\d+)/);
                        return id ? `https://player.vimeo.com/video/${id[1]}` : v.video_url;
                      }
                      return v.video_url;
                    })()}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={landingVideos[0]?.title}
                  />
                </div>
              </div>
              {landingVideos[0]?.title && <p className="text-center text-[#FFD700]/60 text-xs md:text-sm mt-2">{landingVideos[0].title}</p>}
            </div>
          )}
        </div>
      </motion.section>
      {/* Features */}
      <motion.section {...reveal} id="info" className="relative py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 gold-text">¿Qué es Global Dorado?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Es una plataforma que ofrece oportunidades reales como promotor de ventas. Los <strong className="text-[#FFD700]">socios ganan el 80% de comisión directa</strong> por cada venta del acceso vitalicio al sistema.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="group rounded-3xl p-8 md:p-10 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-[#FFD700]/20 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.03)]">
              <h3 className="text-2xl font-bold gold-text mb-4">¿Cómo funciona?</h3>
              <p className="text-gray-300 leading-relaxed">Operamos como un equipo élite de afiliados. Brindamos capacitación maestra y recursos premium para que los miembros operen su negocio digital desde casa con efectividad absoluta.</p>
            </div>
            <div className="group rounded-3xl p-8 md:p-10 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-[#FFD700]/20 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.03)]">
              <h3 className="text-2xl font-bold text-white mb-4">¿Es legítimo?</h3>
              <p className="text-gray-300 leading-relaxed">Sí. El valor real reside en la <strong className="text-[#FFD700]">capacitación especializada en viralidad</strong> y el acceso a una de las bibliotecas de software y servicios digitales más grandes del mercado.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="group rounded-2xl p-6 text-center bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-[#FFD700]/15 transition-all duration-300 shadow-[0_1px_8px_rgba(0,0,0,0.1)]">
                  <Icon className="w-8 h-8 text-[#FFD700] mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="font-bold text-white text-sm mb-1">{f.title}</h4>
                  <p className="text-gray-500 text-xs">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* THE METHOD */}
      <motion.section {...reveal} className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="section-title text-4xl md:text-5xl mb-4"><IconEducation className="w-6 h-6 text-[#FFD700] inline mr-2" />Sistema de Capacitación</h2>
            <p className="section-subtitle text-lg">El Método Global Dorado</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass rounded-3xl p-8 md:p-10 border border-[#FFD700]/10 group hover:border-[#FFD700]/20 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-[#FFD700]/15 to-[#DAA520]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <IconLightning className="w-7 h-7 text-[#FFD700]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Cursos de Viralidad Orgánica</h3>
              <p className="text-gray-400 leading-relaxed">
                Te enseñamos a dominar los algoritmos de <strong className="text-[#FFD700]">TikTok, Instagram Reels y YouTube</strong> 
                para atraer clientes en masa sin gastar un centavo en publicidad. 
                Enfoque quirúrgico en retención y conversión.
              </p>
            </div>
            <div className="glass rounded-3xl p-8 md:p-10 border border-[#FFD700]/10 group hover:border-[#FFD700]/20 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-[#FFD700]/15 to-[#DAA520]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <IconStar className="w-7 h-7 text-[#FFD700]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Estrategias de Venta y Cierre</h3>
              <p className="text-gray-400 leading-relaxed">
                Proporcionamos <strong className="text-[#FFD700]">guiones, psicología de venta</strong> y técnicas de 
                cierre de alto impacto para comercializar el acceso a la comunidad 
                de forma infalible.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CATALOG PREVIEW */}
      <motion.section {...reveal} className="relative py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title text-4xl md:text-5xl mb-4"><IconTools className="w-6 h-6 text-[#FFD700] inline mr-2" />El Arsenal Digital</h2>
            <p className="section-subtitle text-lg">La biblioteca de software y servicios digitales más grande del mercado</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.title} className="glass rounded-2xl p-6 border border-[#FFD700]/5 hover:border-[#FFD700]/20 transition-all duration-300 group">
                  <Icon className="w-8 h-8 text-[#FFD700] mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold text-white mb-2">{cat.title}</h3>
                  <p className="text-gray-400 text-sm">{cat.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="glass rounded-3xl p-8 md:p-10 border border-[#FFD700]/10">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Algunos de los recursos incluidos:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {arsenalItems.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-400">
                  <IconCheck className="w-4 h-4 text-[#FFD700] flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 text-sm mt-8 border-t border-[#FFD700]/10 pt-6">
              ...y muchos más. <strong className="text-[#FFD700]">Siempre se añaden nuevos servicios</strong> y maneras de generar ingresos adicionales.
            </p>
          </div>
        </div>
      </motion.section>

      {/* AI CHAT */}
      <motion.section {...reveal} className="relative py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass rounded-3xl p-10 md:p-16 border border-[#FFD700]/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD700]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00D4FF]/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#DAA520] to-[#B8860B] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#FFD700]/20">
                <IconChat className="w-8 h-8 text-white" />
              </div>
              <h2 className="section-title text-3xl md:text-4xl mb-4"><IconRobot className="w-6 h-6 text-[#FFD700] inline mr-2" />Chat con IA Integrado</h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
                Conecta con múltiples proveedores de IA desde un solo lugar. 
                <strong className="text-[#FFD700]"> ChatGPT Plus, Gemini, Perplexity, Claude</strong> y más — 
                incluido en tu acceso vitalicio.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* LANDING VIDEOS */}
      {landingVideos.length > 0 && (
        <motion.section {...reveal} className="relative py-24 md:py-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="section-title text-4xl md:text-5xl mb-4"><IconVideo className="w-6 h-6 text-[#FFD700] inline mr-2" />Contenido Exclusivo</h2>
              <p className="section-subtitle text-lg">Descubre nuestro contenido en video</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {landingVideos.map((v: any) => (
                <div key={v.id} className="glass rounded-2xl overflow-hidden border border-[#FFD700]/10 hover:border-[#FFD700]/20 transition-all group">
                  <div className="relative" style={{ aspectRatio: '16/9' }}>
                    {v.thumbnail_url ? (
                      <img loading="lazy" src={v.thumbnail_url} alt={v.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-[#111] flex items-center justify-center">
                        <IconPlay className="w-16 h-16 text-[#FFD700]/30 group-hover:text-[#FFD700]/60 transition-colors" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#FFD700]/20 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconPlay className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      {v.platform && <span className="badge badge-gold text-xs">{v.platform}</span>}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{v.title}</h3>
                    {v.description && <p className="text-gray-400 text-sm">{v.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* SOCIOS */}
      {partners.length > 0 && (
        <motion.section {...reveal} className="relative py-24 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/5 via-transparent to-transparent" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-12">
              <h2 className="section-title text-4xl md:text-5xl mb-4"><IconUsers className="w-6 h-6 text-[#FFD700] inline mr-2" />Nuestros Socios</h2>
              <p className="section-subtitle text-lg">Conoce al equipo que transforma el internet en dinero</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {partners.map((p: any) => (
                <div key={p.id} className="glass rounded-2xl p-6 text-center border border-[#FFD700]/10 hover:border-[#FFD700]/20 transition-all group">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-[#FFD700]/20 group-hover:ring-[#FFD700]/40 transition-all">
                    {p.photo_url ? (
                      <img loading="lazy" src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#DAA520] to-[#B8860B] flex items-center justify-center text-2xl font-bold text-black">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-white mb-1">{p.name}</h3>
                  {p.role && <p className="text-[#FFD700]/70 text-sm">{p.role}</p>}
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* CTA FINAL */}
      <motion.section {...reveal} className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFD700]/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="section-title text-4xl md:text-6xl mb-6">¿Listo para transformar el internet en dinero?</h2>
          <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Únete a Global Dorado y accede al arsenal digital más completo, 
            capacitación elite y oportunidades reales de ingresos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-lg px-12 py-5 inline-flex items-center gap-3 group">
              Crear cuenta gratis <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-12 py-5 inline-flex items-center gap-2">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </motion.section>
      <footer className="border-t border-[#FFD700]/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Logo size={24} />
              <span className="text-sm text-gray-500">© 2026 Global Dorado</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>Acceso Vitalicio</span>
              <span className="text-[#FFD700]/30">•</span>
              <span>80% Comisión</span>
              <span className="text-[#FFD700]/30">•</span>
              <span>Soporte VIP 24/7</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-600 mt-6">
            Global Dorado — Transforma el Internet en Dinero.
          </p>
        </div>
      </footer>
      <FloatingButtons />
    </div>
  );
}
