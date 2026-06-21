import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Logo from '../components/Logo';
import FloatingButtons from '../components/FloatingButtons';
import { IconArrowRight, IconChevronDown, IconPlay, IconLightning, IconStar, IconShield, IconGlobe, IconCheck, IconUsers } from '../icons/PremiumIcons';
import { SectionStreaming, SectionBooks, SectionApps, SectionTelegram, SectionServices, SectionAcademy, SectionAffiliate, IconCourses, IconChat, IconEducation, IconTools, IconRobot, IconVideo } from '../icons/PremiumIcons';

function SectionReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 60 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

const stats = [
  { value: '170+', label: 'Servicios' },
  { value: '80%', label: 'Comision' },
  { value: '24/7', label: 'Soporte' },
  { value: '1', label: 'Pago Unico' },
];

const features = [
  { icon: IconShield, title: 'Acceso Vitalicio', desc: 'Un solo pago. Sin mensualidades ni costos ocultos.' },
  { icon: IconLightning, title: '80% Comision', desc: 'Gana el 80% por cada venta como promotor.' },
  { icon: IconGlobe, title: 'Actualizaciones', desc: 'Cada nuevo servicio se agrega sin costo adicional.' },
  { icon: IconStar, title: 'Soporte VIP', desc: 'Asistencia directa cuando la necesites.' },
];

const catalog = [
  { icon: SectionStreaming, title: 'Streaming', desc: 'Netflix, Disney+, HBO Max, Prime Video, Spotify y mas' },
  { icon: IconCourses, title: 'Capacitacion', desc: 'Cursos de marketing digital y estrategias de venta' },
  { icon: SectionServices, title: 'Software', desc: 'Office 365, Adobe CC, AutoCAD, Solidworks, ChatGPT Plus' },
  { icon: SectionBooks, title: 'Libros', desc: 'Biblioteca digital de desarrollo personal y negocios' },
  { icon: SectionApps, title: 'Apps', desc: 'Aplicaciones premium para productividad y diseno' },
  { icon: SectionAcademy, title: 'Academia', desc: 'El Metodo Global Dorado de capacitacion' },
];

const arsenalItems = [
  'Netflix, Disney+, MAX, YouTube Premium', 'Spotify Premium, Apple Music, Tidal',
  'Office 365 Premium / Pro', 'Adobe Creative Cloud', 'ChatGPT Plus, Gemini IA, Perplexity',
  'Windows 10 & 11 Pro', 'AutoCAD, Civil 3D, Revit, Inventor', 'Solidworks, SketchUp',
  'CapCut Pro, Canva Pro', 'CorelDraw, Photoshop, Illustrator',
  'Eset Nod32, Antivirus', 'Nitro PDF 14 Pro', 'Camtasia, Filmora',
  'PlayStation, Nintendo, Xbox', 'Y mucho mas...',
];

export default function LandingPage() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const [partners, setPartners] = useState<any[]>([]);
  const [landingVideos, setLandingVideos] = useState<any[]>([]);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 80]);

  useEffect(() => {
    api.get('/partners/active').then((r) => setPartners(r.data)).catch(() => {});
    api.get('/partners/landing-videos').then((r) => setLandingVideos(r.data)).catch(() => {});
  }, []);

  return (
    <div className="bg-[#0a0a0f] text-white">
      {/* HERO */}
      <motion.section style={{ y: heroY }} className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.06),transparent_50%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#F59E0B]/[0.04] rounded-full blur-[120px]" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, type: "spring" }}>
            <Logo size={72} className="mx-auto mb-6 drop-shadow-[0_0_30px_rgba(255,215,0,0.4)]" />
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-[#FFD700]/60 text-sm tracking-[0.4em] uppercase mb-4">Plataforma Digital Todo en Uno</motion.p>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 leading-[0.95]"
            style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontWeight: 700, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 30%, #FFD700 50%, #FBBF24 70%, #F59E0B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 100%' }}>
            Global Dorado
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Ecosistema digital con acceso vitalicio. El arsenal de software y servicios digitales mas completo del mercado con oportunidades reales de ingresos.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="group px-8 py-3.5 bg-[#FFD700] text-black font-bold rounded-xl text-base hover:bg-[#FFE44D] transition-all shadow-[0_4px_20px_rgba(255,215,0,0.25)] inline-flex items-center gap-2">
              Comenzar Ahora <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="px-8 py-3.5 border border-white/10 text-gray-400 font-medium rounded-xl text-base hover:border-white/30 hover:text-white transition-all inline-flex items-center gap-2">
              Iniciar Sesion
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 + i * 0.1 }}
                className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-2xl md:text-3xl font-bold text-[#FFD700]">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {landingVideos.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}
              className="mt-10 max-w-2xl mx-auto">
              <div className="rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                <div className="relative aspect-video">
                  <iframe src={(() => { const v = landingVideos[0]; if (v.video_type === 'youtube') { const id = v.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/); return id ? `https://www.youtube.com/embed/${id[1]}` : v.video_url; } if (v.video_type === 'vimeo') { const id = v.video_url.match(/vimeo\.com\/(\d+)/); return id ? `https://player.vimeo.com/video/${id[1]}` : v.video_url; } return v.video_url; })()}
                    className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen" allowFullScreen title={landingVideos[0]?.title} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* FEATURES */}
      <SectionReveal className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-[#FFD700]/60 text-xs tracking-[0.3em] uppercase mb-3">¿Por que Global Dorado?</p>
            <h2 className="text-3xl md:text-5xl font-bold gold-text mb-4" style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}>
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">Acceso ilimitado a software, streaming, capacitacion y oportunidades de ingreso.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }} className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-[#FFD700]/20 hover:bg-white/[0.04] transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center mb-4 group-hover:bg-[#FFD700]/20 transition-colors">
                    <Icon className="w-5 h-5 text-[#FFD700]" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* CATALOG */}
      <SectionReveal className="py-24 md:py-32 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-[#FFD700]/60 text-xs tracking-[0.3em] uppercase mb-3">Catalogo</p>
            <h2 className="text-3xl md:text-5xl font-bold gold-text mb-4" style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}>
              Arsenal Digital Completo
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">170+ servicios en streaming, software, IA, diseno y mas.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {catalog.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -2 }} className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-[#FFD700]/10 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-[#FFD700]/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FFD700]/10 transition-colors">
                    <Icon className="w-5 h-5 text-[#FFD700]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{cat.title}</h3>
                    <p className="text-gray-500 text-sm">{cat.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-gray-500 text-xs text-center mb-3">SERVICIOS INCLUIDOS</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              {arsenalItems.map((item, i) => (
                <span key={i} className="text-gray-400 text-xs flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#FFD700]/40" /> {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* CAPACITACION */}
      <SectionReveal className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#FFD700]/60 text-xs tracking-[0.3em] uppercase mb-3">Capacitacion</p>
              <h2 className="text-3xl md:text-5xl font-bold gold-text mb-6" style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}>
                Aprende a generar ingresos
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Te ensenamos a dominar las redes sociales, estrategias de venta y tecnicas de cierre para comercializar servicios digitales de forma efectiva.
              </p>
              <div className="space-y-3">
                {['Estrategias de venta y cierre', 'Marketing en redes sociales', 'Guiones de persuasion', 'Soporte y mentoria personalizada'].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-[#FFD700]/10 flex items-center justify-center flex-shrink-0">
                      <IconCheck className="w-3 h-3 text-[#FFD700]" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="relative p-8 rounded-3xl bg-gradient-to-br from-[#FFD700]/5 to-transparent border border-[#FFD700]/10">
              <div className="text-center">
                <IconEducation className="w-16 h-16 text-[#FFD700] mx-auto mb-4" />
                <p className="text-[#FFD700] font-bold text-lg mb-1">El Metodo</p>
                <p className="text-gray-400 text-sm">Global Dorado</p>
              </div>
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* AI */}
      <SectionReveal className="py-24 md:py-32 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#FFD700]/60 text-xs tracking-[0.3em] uppercase mb-3">Inteligencia Artificial</p>
          <h2 className="text-3xl md:text-5xl font-bold gold-text mb-6" style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}>
            Chat con IA Integrado
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            Conecta con ChatGPT Plus, Gemini, Perplexity y Claude desde un solo lugar. Incluido en tu acceso vitalicio.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {['ChatGPT Plus', 'Gemini AI', 'Perplexity Pro', 'Claude AI'].map((name, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="px-5 py-2 rounded-full bg-[#FFD700]/5 border border-[#FFD700]/10 text-[#FFD700] text-sm font-medium">
                {name}
              </motion.span>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* TESTIMONIALS */}
      <SectionReveal className="py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#FFD700]/60 text-xs tracking-[0.3em] uppercase mb-3">Testimonios</p>
            <h2 className="text-3xl md:text-5xl font-bold gold-text mb-4" style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}>
              Lo que dicen nuestros socios
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Maria G.', role: 'Socia Activa', text: 'Con Global Dorado aprendi a vender servicios digitales. Ya tengo 15 clientes fijos y gano en dolares desde casa.' },
              { name: 'Carlos R.', role: 'Afiliado', text: 'La capacitacion me ayudo a entender el negocio. El soporte 24/7 es real, siempre me resuelven las dudas.' },
              { name: 'Ana L.', role: 'Lider', text: 'Empece sin saber nada y hoy tengo mi propio equipo. Global Dorado cambio mi vida financiera.' }
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(n => <span key={n} className="text-[#FFD700] text-sm">★</span>)}
                </div>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center text-xs font-bold text-[#FFD700]">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* SOCIOS */}
      {partners.length > 0 && (
        <SectionReveal className="py-24 md:py-32 bg-white/[0.01]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-[#FFD700]/60 text-xs tracking-[0.3em] uppercase mb-3">Equipo</p>
              <h2 className="text-3xl md:text-5xl font-bold gold-text mb-4" style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}>
                Nuestros Socios
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {partners.map((p: any, i: number) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-[#FFD700]/10 transition-all">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden ring-1 ring-[#FFD700]/20">
                    {p.photo_url ? (
                      <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#FFD700]/10 flex items-center justify-center text-lg font-bold text-[#FFD700]">
                        {p.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="text-white text-sm font-medium">{p.name}</p>
                  {p.role && <p className="text-[#FFD700]/60 text-xs">{p.role}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </SectionReveal>
      )}

      {/* CTA */}
      <SectionReveal className="py-32 md:py-40 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-6xl font-bold gold-text mb-6" style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}>
            ¿Listo para empezar?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
            Unete a Global Dorado y accede al arsenal digital mas completo con oportunidades reales de ingresos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="px-10 py-4 bg-[#FFD700] text-black font-bold rounded-xl text-lg hover:bg-[#FFE44D] transition-all shadow-[0_4px_24px_rgba(255,215,0,0.25)] inline-flex items-center gap-2">
              Crear Cuenta Gratis <IconArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="px-10 py-4 border border-white/10 text-gray-400 font-medium rounded-xl text-lg hover:border-white/30 hover:text-white transition-all">
              Iniciar Sesion
            </Link>
          </div>
        </div>
      </SectionReveal>

      <footer className="border-t border-white/[0.04] py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span className="text-xs text-gray-600">© 2026 Global Dorado</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Acceso Vitalicio</span>
            <span>·</span>
            <span>80% Comision</span>
            <span>·</span>
            <span>Soporte 24/7</span>
          </div>
        </div>
      </footer>

      <FloatingButtons />
    </div>
  );
}
