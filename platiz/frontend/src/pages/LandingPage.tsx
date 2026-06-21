import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Logo from '../components/Logo';
import FloatingButtons from '../components/FloatingButtons';
import { IconArrowRight, IconChevronDown, IconPlay, IconLightning, IconStar, IconShield, IconGlobe, IconCheck, IconUsers } from '../icons/PremiumIcons';
import { SectionStreaming, SectionBooks, SectionApps, SectionServices, SectionAcademy, SectionAffiliate, IconCourses, IconChat, IconEducation, IconTools, IconRobot, IconVideo, SectionTelegram } from '../icons/PremiumIcons';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } })
};

const cardBase = 'rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#FCD34D]/30 transition-all duration-300';
const cardHover = 'hover:-translate-y-1 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)]';

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }} className={className}>
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [landingVideos, setLandingVideos] = useState<any[]>([]);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 40]);

  useEffect(() => {
    api.get('/partners/active').then((r) => setPartners(r.data)).catch(() => {});
    api.get('/partners/landing-videos').then((r) => setLandingVideos(r.data)).catch(() => {});
  }, []);

  return (
    <div className="bg-[#0A0A0A] text-white overflow-hidden">
      {/* HERO */}
      <motion.section style={{ y: heroY }} className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.06),transparent_60%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#FFD700]/[0.03] rounded-full blur-[120px]" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, type: "spring", stiffness: 200 }}>
            <Logo size={64} className="mx-auto mb-6 drop-shadow-[0_0_24px_rgba(255,215,0,0.35)]" />
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-[#FCD34D]/60 text-xs tracking-[0.35em] uppercase mb-5 font-medium">Plataforma Digital Todo en Uno</motion.p>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 leading-[0.95]"
            style={{ fontFamily: "'Bodoni Moda', Georgia, serif", textShadow: '0 0 60px rgba(255,215,0,0.15)' }}>
            <span className="text-white">Global </span>
            <span className="bg-gradient-to-r from-[#FFD700] to-[#B8860B] bg-clip-text text-transparent">Dorado</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="text-base md:text-lg text-[#A0A0A0] max-w-xl mx-auto mb-10 leading-relaxed">
            Ecosistema digital con acceso vitalicio. El arsenal de software y servicios digitales mas completo del mercado con oportunidades reales de ingresos.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register"
              className="px-10 py-4 bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-black font-bold rounded-xl text-base hover:from-[#FFE44D] hover:to-[#DAA520] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(255,215,0,0.3)] transition-all duration-200 inline-flex items-center gap-2">
              Comenzar Ahora <IconArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login"
              className="px-10 py-4 border border-[#FCD34D]/20 text-[#D1D5DB] font-medium rounded-xl text-base hover:border-[#FCD34D]/40 hover:text-white transition-all duration-200">
              Iniciar Sesion
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ v: '170+', l: 'Servicios Digitales' }, { v: '80%', l: 'Comision Directa' }, { v: '24/7', l: 'Soporte VIP' }, { v: '1', l: 'Pago Unico' }].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 0.1 }}
                className="text-center p-5 rounded-2xl bg-[#111111] border border-[#2A2A2A]">
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#FFD700] to-[#B8860B] bg-clip-text text-transparent" style={{ textShadow: '0 0 20px rgba(255,215,0,0.2)' }}>
                  {s.v}
                </p>
                <p className="text-xs text-[#A0A0A0] mt-1.5">{s.l}</p>
              </motion.div>
            ))}
          </motion.div>

          {landingVideos.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
              className="mt-12 max-w-2xl mx-auto">
              <div className="rounded-2xl overflow-hidden border border-[#2A2A2A] shadow-2xl">
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
      <Reveal className="py-28 md:py-36">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <p className="text-[#FCD34D]/50 text-xs tracking-[0.3em] uppercase mb-4">¿Por que Global Dorado?</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px' }}>
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-[#A0A0A0] max-w-lg mx-auto">Acceso ilimitado a software, streaming, capacitacion y oportunidades de ingreso.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { i: IconShield, t: 'Acceso Vitalicio', d: 'Un solo pago. Sin mensualidades ni costos ocultos.' },
              { i: IconLightning, t: '80% Comision', d: 'Gana el 80% por cada venta como promotor.' },
              { i: IconGlobe, t: 'Actualizaciones', d: 'Cada nuevo servicio se agrega sin costo adicional.' },
              { i: IconStar, t: 'Soporte VIP', d: 'Asistencia directa cuando la necesites.' }
            ].map((f, i) => {
              const I = f.i;
              return (
                <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className={`${cardBase} ${cardHover} p-7 group`}>
                  <div className="w-11 h-11 rounded-xl bg-[#FFD700]/8 flex items-center justify-center mb-5 group-hover:bg-[#FFD700]/12 transition-colors">
                    <I className="w-5 h-5 text-[#FFD700]" />
                  </div>
                  <h3 className="text-white font-semibold text-base mb-2">{f.t}</h3>
                  <p className="text-[#A0A0A0] text-sm leading-relaxed">{f.d}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* CATALOG */}
      <Reveal className="py-28 md:py-36">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <p className="text-[#FCD34D]/50 text-xs tracking-[0.3em] uppercase mb-4">Catalogo</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px' }}>
              Arsenal Digital Completo
            </h2>
            <p className="text-[#A0A0A0] max-w-lg mx-auto">170+ servicios en streaming, software, IA, diseno y mas.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { i: SectionStreaming, t: 'Streaming', d: 'Netflix, Disney+, HBO Max, Prime Video, Spotify y mas' },
              { i: IconCourses, t: 'Capacitacion', d: 'Cursos de marketing digital y estrategias de venta' },
              { i: SectionServices, t: 'Software', d: 'Office 365, Adobe CC, AutoCAD, ChatGPT Plus' },
              { i: SectionBooks, t: 'Libros', d: 'Biblioteca digital de desarrollo personal y negocios' },
              { i: SectionApps, t: 'Apps', d: 'Aplicaciones premium para productividad y diseno' },
              { i: SectionAcademy, t: 'Academia', d: 'El Metodo Global Dorado de capacitacion' },
            ].map((cat, i) => {
              const I = cat.i;
              return (
                <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className={`${cardBase} ${cardHover} flex items-start gap-4 p-5 group`}>
                  <div className="w-10 h-10 rounded-xl bg-[#FFD700]/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FFD700]/10 transition-colors">
                    <I className="w-5 h-5 text-[#FFD700]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1">{cat.t}</h3>
                    <p className="text-[#A0A0A0] text-xs leading-relaxed">{cat.d}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className={`${cardBase} p-6 text-center`}>
            <p className="text-[#FCD34D]/50 text-xs mb-4 tracking-wider uppercase">Servicios Incluidos</p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2.5">
              {['Netflix, Disney+, MAX, YouTube', 'Spotify, Apple Music, Tidal', 'Office 365 Pro', 'Adobe Creative Cloud', 'ChatGPT, Gemini, Perplexity', 'Windows 10 & 11 Pro', 'AutoCAD, Solidworks, Revit', 'CapCut Pro, Canva Pro', 'CorelDraw, Photoshop', 'Antivirus y Seguridad', 'PlayStation, Xbox, Nintendo', 'Y mucho mas...'].map((item, i) => (
                <span key={i} className="text-[#A0A0A0] text-xs flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#FFD700]/40" /> {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </Reveal>

      {/* CAPACITACION */}
      <Reveal className="py-28 md:py-36">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#FCD34D]/50 text-xs tracking-[0.3em] uppercase mb-4">Capacitacion</p>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px' }}>
                Aprende a generar ingresos
              </h2>
              <p className="text-[#A0A0A0] leading-relaxed mb-8">
                Te ensenamos a dominar las redes sociales, estrategias de venta y tecnicas de cierre para comercializar servicios digitales de forma efectiva.
              </p>
              <div className="space-y-4">
                {['Estrategias de venta y cierre', 'Marketing en redes sociales', 'Guiones de persuasion', 'Soporte y mentoria personalizada'].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#FFD700]/10 flex items-center justify-center flex-shrink-0">
                      <IconCheck className="w-3 h-3 text-[#FFD700]" />
                    </div>
                    <span className="text-[#D1D5DB] text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className={`${cardBase} p-12 text-center border-[#FCD34D]/10`}>
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#FFD700]/15 to-[#B8860B]/10 flex items-center justify-center">
                <IconEducation className="w-10 h-10 text-[#FFD700]" />
              </div>
              <p className="text-[#FFD700] font-bold text-xl mb-1">El Metodo</p>
              <p className="text-[#A0A0A0]">Global Dorado</p>
            </motion.div>
          </div>
        </div>
      </Reveal>

      {/* AI */}
      <Reveal className="py-28 md:py-36">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <p className="text-[#FCD34D]/50 text-xs tracking-[0.3em] uppercase mb-4">Inteligencia Artificial</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px' }}>
            Chat con IA Integrado
          </h2>
          <p className="text-[#A0A0A0] max-w-lg mx-auto mb-10">
            Conecta con ChatGPT Plus, Gemini, Perplexity y Claude desde un solo lugar. Incluido en tu acceso vitalicio.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {['ChatGPT Plus', 'Gemini AI', 'Perplexity Pro', 'Claude AI'].map((name, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="px-6 py-2.5 rounded-full bg-[#FFD700]/5 border border-[#FCD34D]/10 text-[#FFD700] text-sm font-medium">
                {name}
              </motion.span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* TESTIMONIALS */}
      <Reveal className="py-28 md:py-36">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-[#FCD34D]/50 text-xs tracking-[0.3em] uppercase mb-4">Testimonios</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px' }}>
              Lo que dicen nuestros socios
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: 'Maria G.', r: 'Socia Activa', t: 'Con Global Dorado aprendi a vender servicios digitales. Ya tengo 15 clientes fijos y gano en dolares desde casa.' },
              { n: 'Carlos R.', r: 'Afiliado', t: 'La capacitacion me ayudo a entender el negocio. El soporte 24/7 es real, siempre me resuelven las dudas.' },
              { n: 'Ana L.', r: 'Lider', t: 'Empece sin saber nada y hoy tengo mi propio equipo. Global Dorado cambio mi vida financiera.' }
            ].map((t, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className={`${cardBase} ${cardHover} p-7`}>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(n => <span key={n} className="text-[#FFD700] text-xs">★</span>)}
                </div>
                <p className="text-[#D1D5DB] text-sm mb-6 leading-relaxed italic">"{t.t}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-xs font-bold text-[#FFD700]">{t.n.charAt(0)}</div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.n}</p>
                    <p className="text-[#A0A0A0] text-xs">{t.r}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* SOCIOS */}
      {partners.length > 0 && (
        <Reveal className="py-28 md:py-36">
          <div className="max-w-5xl mx-auto px-5">
            <div className="text-center mb-14">
              <p className="text-[#FCD34D]/50 text-xs tracking-[0.3em] uppercase mb-4">Equipo</p>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px' }}>
                Nuestros Socios
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {partners.map((p: any, i: number) => (
                <motion.div key={p.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className={`${cardBase} ${cardHover} p-6 text-center`}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-[#FCD34D]/10">
                    {p.photo_url ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-[#FFD700]/10 flex items-center justify-center text-lg font-bold text-[#FFD700]">{p.name.charAt(0)}</div>}
                  </div>
                  <p className="text-white text-sm font-medium">{p.name}</p>
                  {p.role && <p className="text-[#A0A0A0] text-xs mt-1">{p.role}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* CTA */}
      <Reveal className="py-32 md:py-44 text-center">
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="text-3xl md:text-6xl font-extrabold text-white mb-6 tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px', textShadow: '0 0 40px rgba(255,215,0,0.1)' }}>
            ¿Listo para empezar?
          </h2>
          <p className="text-[#A0A0A0] text-lg mb-10 max-w-md mx-auto">
            Unete a Global Dorado y accede al arsenal digital mas completo con oportunidades reales de ingresos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register"
              className="px-12 py-4.5 bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-black font-bold rounded-xl text-lg hover:from-[#FFE44D] hover:to-[#DAA520] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(255,215,0,0.3)] transition-all duration-200 inline-flex items-center gap-2">
              Crear Cuenta Gratis <IconArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login"
              className="px-12 py-4.5 border border-[#FCD34D]/20 text-[#D1D5DB] font-medium rounded-xl text-lg hover:border-[#FCD34D]/40 hover:text-white transition-all duration-200">
              Iniciar Sesion
            </Link>
          </div>
        </div>
      </Reveal>

      <footer className="border-t border-[#1F2937] py-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo size={20} />
            <span className="text-xs text-[#6B7280]">© 2026 Global Dorado</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-[#6B7280]">
            <span>Acceso Vitalicio</span><span>·</span><span>80% Comision</span><span>·</span><span>Soporte 24/7</span>
          </div>
        </div>
      </footer>

      <FloatingButtons />
    </div>
  );
}
