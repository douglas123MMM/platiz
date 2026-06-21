import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';
import FloatingButtons from '../components/FloatingButtons';
import { IconArrowRight, IconChevronDown, IconPlay, IconLightning, IconStar, IconShield, IconGlobe, IconCheck } from '../icons/PremiumIcons';
import { SectionStreaming, SectionBooks, SectionApps, SectionTelegram, SectionServices, SectionAcademy, SectionAffiliate, IconCourses, IconChat, IconEducation, IconTools, IconRobot, IconVideo, IconUsers } from '../icons/PremiumIcons';

const features = [
  { title: '80% Comision Directa', desc: 'Gana el 80% por cada venta del acceso vitalicio al sistema.', icon: IconLightning, color: '#FFD700' },
  { title: 'Acceso Vitalicio', desc: 'Un solo pago para toda la vida. Sin mensualidades ni cuotas ocultas.', icon: IconStar, color: '#FFD700' },
  { title: 'Soporte VIP 24/7', desc: 'Asistencia directa y personalizada cuando la necesites, sin limites.', icon: IconShield, color: '#FFD700' },
  { title: 'Actualizaciones Perpetuas', desc: 'Acceso gratuito a cada nuevo servicio que se anexe al sistema.', icon: IconGlobe, color: '#FFD700' },
];

const categories = [
  { icon: SectionStreaming, title: 'Entretenimiento', desc: 'Netflix, Disney+, Spotify, YouTube Premium, gaming y mas' },
  { icon: IconCourses, title: 'Capacitacion', desc: 'Cursos de marketing digital, estrategias de venta y cierre' },
  { icon: SectionBooks, title: 'Libros', desc: 'Biblioteca digital con libros de desarrollo personal y negocios' },
  { icon: SectionApps, title: 'Aplicaciones', desc: 'Apps moviles y web para potenciar tu productividad' },
  { icon: SectionTelegram, title: 'Comunidad Telegram', desc: 'Canales VIP con soporte 24/7 y contenido exclusivo' },
  { icon: SectionServices, title: 'Arsenal Digital', desc: 'Office 365, Adobe, Solidworks, AutoCAD, ChatGPT Plus y mas' },
  { icon: SectionAcademy, title: 'Academia Global', desc: 'El Metodo: capacitacion maestra para tu negocio digital' },
  { icon: SectionAffiliate, title: 'Afiliacion', desc: 'Instrucciones y enlaces para promover Global Dorado' },
];

const arsenalItems = [
  'Office 365 Premium / Personal / Pro', 'Windows 10 & 11 Pro', 'Adobe Creative Cloud 1 ano',
  'AutoCAD, Civil 3D, Revit, Inventor', 'Solidworks 2016-2024', 'SketchUp 2021-2025',
  'ChatGPT Plus', 'Gemini IA', 'Perplexity Pro', 'Netflix, Disney+, MAX, YouTube Premium',
  'Spotify Premium, Apple Music, Tidal', 'CapCut Pro, Canva Pro',
  'Eset Nod32 / Internet Security', 'CorelDraw 2021-2025', 'Photoshop e Illustrator',
  'Nitro PDF 14 Pro', 'Camtasia, Filmora', 'PlayStation 4/5, Nintendo Switch',
];

const easeOut: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } }
};

const cardHover = { scale: 1.02, y: -4, transition: { duration: 0.3 } };

function AnimatedSection({ children, className = '', delay = 0, ...props }: { children: React.ReactNode; className?: string; delay?: number; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 60 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const [partners, setPartners] = useState<any[]>([]);
  const [landingVideos, setLandingVideos] = useState<any[]>([]);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 60]);

  useEffect(() => {
    api.get('/partners/active').then((r) => setPartners(r.data)).catch(() => {});
    api.get('/partners/landing-videos').then((r) => setLandingVideos(r.data)).catch(() => {});
  }, []);

  return (
    <div className="bg-[#0a0a0f] text-white overflow-hidden">
      {/* Floating particles background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div key={i} className="absolute w-1 h-1 bg-[#FFD700]/20 rounded-full"
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
            animate={{ y: [null, -100], opacity: [0, 0.5, 0] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Hero */}
      <motion.section ref={heroRef} style={{ y: heroY }}
        className="relative min-h-screen flex items-center justify-center pt-16 pb-8 md:pb-0 z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.10),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,180,255,0.05),transparent_50%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#FFD700]/[0.06] rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-0 left-0 right-0 h-64" style={{ background: 'linear-gradient(to top,#0a0a0f,transparent)' }} />

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }}>
            <Logo size={80} className="mx-auto mb-8 drop-shadow-[0_0_40px_rgba(255,215,0,0.5)]" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight gold-text mb-6 leading-[1.1]">
            Global Dorado
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-3xl lg:text-4xl font-light text-[#FFD700]/80 tracking-[0.3em] md:tracking-[0.5em] uppercase mb-6">
            Transforma el Internet en Dinero
          </motion.p>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.8 }}
            className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed mb-10">
            Ecosistema digital de alta gama con acceso vitalicio. Capacitacion especializada en marketing digital, el arsenal de software y servicios digitales mas completo del mercado, y oportunidades reales de ingresos como promotor.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="group relative inline-flex items-center gap-2 px-10 py-4 bg-[#FFD700] text-black font-bold rounded-2xl text-lg hover:bg-[#FFE44D] active:scale-[0.98] transition-all duration-200 shadow-[0_8px_32px_rgba(255,215,0,0.3)] hover:shadow-[0_12px_40px_rgba(255,215,0,0.45)] min-h-[56px] overflow-hidden">
              <span className="relative z-10">Comenzar ahora</span>
              <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              <motion.div className="absolute inset-0 bg-white/20" initial={{ x: "-100%" }} whileHover={{ x: 0 }} transition={{ duration: 0.3 }} />
            </Link>
            <button onClick={() => scrollTo('info')} className="group inline-flex items-center gap-2 px-10 py-4 border border-white/10 text-gray-300 font-semibold rounded-2xl text-lg hover:bg-white/5 hover:border-white/20 hover:text-white active:scale-[0.98] transition-all duration-200 backdrop-blur-sm min-h-[56px]">
              Conocer mas
              <IconChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.5 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            {[{ text: 'Acceso Vitalicio', active: true }, { text: '80% Comision', active: true }, { text: 'Soporte 24/7', active: true }].map((item, i) => (
              <motion.span key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6 + i * 0.15 }} className="flex items-center gap-2">
                <IconCheck className="w-4 h-4 text-[#FFD700]" /> {item.text}
              </motion.span>
            ))}
          </motion.div>

          {landingVideos.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.8 }}
              className="mt-10 md:mt-14 w-full max-w-3xl mx-auto px-2 md:px-0">
              <div className="rounded-2xl overflow-hidden border border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
                <div className="relative aspect-video">
                  <iframe src={(() => { const v = landingVideos[0]; if (v.video_type === 'youtube') { const id = v.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/); return id ? `https://www.youtube.com/embed/${id[1]}` : v.video_url; } if (v.video_type === 'vimeo') { const id = v.video_url.match(/vimeo\.com\/(\d+)/); return id ? `https://player.vimeo.com/video/${id[1]}` : v.video_url; } return v.video_url; })()}
                    className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={landingVideos[0]?.title} />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => scrollTo('info')}>
          <IconChevronDown className="w-8 h-8 text-[#FFD700]/40" />
        </motion.div>
      </motion.section>

      {/* Info Section */}
      <AnimatedSection id="info" className="relative py-24 md:py-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-extrabold mb-4 gold-text">¿Que es Global Dorado?</motion.h2>
            <motion.p variants={itemVariants} className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Es una plataforma que ofrece oportunidades reales como promotor de ventas. Los <strong className="text-[#FFD700]">socios ganan el 80% de comision directa</strong> por cada venta del acceso vitalicio al sistema.
            </motion.p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {[
              { title: '¿Como funciona?', desc: 'Operamos como un equipo elite de afiliados. Brindamos capacitacion maestra y recursos premium para que los miembros operen su negocio digital desde casa con efectividad absoluta.' },
              { title: '¿Es legitimo?', desc: 'Si. El valor real reside en la capacitacion especializada y el acceso a una de las bibliotecas de software y servicios digitales mas grandes del mercado.' }
            ].map((item, i) => (
              <motion.div key={i} variants={itemVariants} whileHover={cardHover}
                className="group rounded-3xl p-8 md:p-10 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-[#FFD700]/20 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.03)]">
                <h3 className="text-2xl font-bold gold-text mb-4">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} variants={itemVariants} whileHover={{ y: -6, borderColor: 'rgba(255,215,0,0.2)' }}
                  className="group rounded-2xl p-6 text-center bg-white/[0.02] border border-white/[0.04] transition-all duration-300">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}>
                    <Icon className="w-8 h-8 text-[#FFD700] mx-auto mb-3" />
                  </motion.div>
                  <h4 className="font-bold text-white text-sm mb-1">{f.title}</h4>
                  <p className="text-gray-500 text-xs">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Method Section */}
      <AnimatedSection className="relative py-24 md:py-32 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4"><IconEducation className="w-7 h-7 text-[#FFD700] inline mr-2" />Sistema de Capacitacion</h2>
            <p className="text-xl text-gray-400">El Metodo Global Dorado</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: IconLightning, title: 'Marketing Digital', desc: 'Te ensenamos a dominar las redes sociales y plataformas digitales para atraer clientes sin gastar en publicidad.' },
              { icon: IconStar, title: 'Estrategias de Venta y Cierre', desc: 'Proporcionamos guiones, psicologia de venta y tecnicas de cierre de alto impacto para comercializar el acceso a la comunidad de forma infalible.' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.2 }} whileHover={cardHover}
                  className="glass rounded-3xl p-8 md:p-10 border border-[#FFD700]/10 group hover:border-[#FFD700]/20 transition-all">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-14 h-14 bg-gradient-to-br from-[#FFD700]/15 to-[#DAA520]/10 rounded-2xl flex items-center justify-center mb-5">
                    <Icon className="w-7 h-7 text-[#FFD700]" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* Catalog Preview */}
      <AnimatedSection className="relative py-24 md:py-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4"><IconTools className="w-7 h-7 text-[#FFD700] inline mr-2" />El Arsenal Digital</h2>
            <p className="text-xl text-gray-400">La biblioteca de software y servicios digitales mas grande del mercado</p>
          </motion.div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div key={i} variants={itemVariants} whileHover={cardHover}
                  className="glass rounded-2xl p-6 border border-[#FFD700]/5 hover:border-[#FFD700]/20 transition-all duration-300 group">
                  <motion.div whileHover={{ scale: 1.15, rotate: -5 }} transition={{ duration: 0.3 }}>
                    <Icon className="w-8 h-8 text-[#FFD700] mb-3" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-white mb-2">{cat.title}</h3>
                  <p className="text-gray-400 text-sm">{cat.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass rounded-3xl p-8 md:p-10 border border-[#FFD700]/10">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Algunos de los recursos incluidos:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {arsenalItems.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }} className="flex items-center gap-2 text-sm text-gray-400">
                  <IconCheck className="w-4 h-4 text-[#FFD700] flex-shrink-0" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-gray-500 text-sm mt-8 border-t border-[#FFD700]/10 pt-6">
              ...y muchos mas. <strong className="text-[#FFD700]">Siempre se anaden nuevos servicios</strong> y maneras de generar ingresos adicionales.
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* AI Chat */}
      <AnimatedSection className="relative py-24 md:py-32 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            whileHover={{ scale: 1.02 }} className="glass rounded-3xl p-10 md:p-16 border border-[#FFD700]/10 relative overflow-hidden">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 right-0 w-80 h-80 bg-[#FFD700]/5 rounded-full blur-3xl" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-0 left-0 w-64 h-64 bg-[#00D4FF]/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <motion.div whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-16 h-16 bg-gradient-to-br from-[#DAA520] to-[#B8860B] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#FFD700]/20">
                <IconChat className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4"><IconRobot className="w-7 h-7 text-[#FFD700] inline mr-2" />Chat con IA Integrado</h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
                Conecta con multiples proveedores de IA desde un solo lugar. <strong className="text-[#FFD700]">ChatGPT Plus, Gemini, Perplexity, Claude</strong> y mas — incluido en tu acceso vitalicio.
              </p>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Landing Videos */}
      {landingVideos.length > 0 && (
        <AnimatedSection className="relative py-24 md:py-32 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4"><IconVideo className="w-7 h-7 text-[#FFD700] inline mr-2" />Contenido Exclusivo</h2>
              <p className="text-xl text-gray-400">Descubre nuestro contenido en video</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {landingVideos.map((v: any, i: number) => (
                <motion.div key={v.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }} whileHover={cardHover}
                  className="glass rounded-2xl overflow-hidden border border-[#FFD700]/10 hover:border-[#FFD700]/20 transition-all group">
                  <div className="relative aspect-video">
                    {v.thumbnail_url ? (
                      <img loading="lazy" src={v.thumbnail_url} alt={v.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-[#111] flex items-center justify-center">
                        <IconPlay className="w-16 h-16 text-[#FFD700]/30 group-hover:text-[#FFD700]/60 transition-colors" />
                      </div>
                    )}
                    <motion.div whileHover={{ scale: 1.1 }} className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#FFD700]/20 backdrop-blur flex items-center justify-center">
                        <IconPlay className="w-8 h-8 text-white ml-1" />
                      </div>
                    </motion.div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{v.title}</h3>
                    {v.description && <p className="text-gray-400 text-sm">{v.description}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Partners */}
      <AnimatedSection className="relative py-24 md:py-32 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/5 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4"><IconUsers className="w-7 h-7 text-[#FFD700] inline mr-2" />Nuestros Socios</h2>
            <p className="text-xl text-gray-400">Conoce al equipo que transforma el internet en dinero</p>
          </motion.div>
          {partners.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {partners.map((p: any, i: number) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 30, scale: 0.9 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }} whileHover={{ y: -8, borderColor: 'rgba(255,215,0,0.3)' }}
                  className="glass rounded-2xl p-6 text-center border border-[#FFD700]/10 transition-all group">
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
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Proximamente...</p>
          )}
        </div>
      </AnimatedSection>

      {/* Testimonials */}
      <AnimatedSection className="relative py-24 md:py-32 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 gold-text">Lo Que Dicen Nuestros Socios</h2>
            <p className="text-xl text-gray-400">Testimonios reales de personas que ya estan generando ingresos</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Maria G.', role: 'Socia Activa', text: 'Con Global Dorado aprendi a vender servicios digitales. Ya tengo 15 clientes fijos y gano en dolares desde casa.' },
              { name: 'Carlos R.', role: 'Afiliado VIP', text: 'La capacitacion me ayudo a entender el negocio. El soporte 24/7 es real, siempre me resuelven las dudas.' },
              { name: 'Ana L.', role: 'Lider de Equipo', text: 'Empece sin saber nada y hoy tengo mi propio equipo de 8 personas. Global Dorado cambio mi vida financiera.' }
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.15 }} whileHover={cardHover}
                className="glass rounded-2xl p-6 border border-[#FFD700]/10 hover:border-[#FFD700]/20 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#B8860B] flex items-center justify-center text-sm font-bold text-black">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-[#FFD700]/60 text-xs">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex gap-0.5 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#FFD700] text-sm">★</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Final */}
      <AnimatedSection className="relative py-32 md:py-40 z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFD700]/10 via-[#FFD700]/5 to-transparent" />
        <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 gold-text">¿Listo para transformar el internet en dinero?</h2>
          <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Unete a Global Dorado y accede al arsenal digital mas completo, capacitacion elite y oportunidades reales de ingresos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-lg px-12 py-5 inline-flex items-center gap-3 group">
              Crear cuenta gratis <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-12 py-5 inline-flex items-center gap-2">
              Iniciar sesion
            </Link>
          </div>
        </motion.div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="border-t border-[#FFD700]/10 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Logo size={24} />
              <span className="text-sm text-gray-500">© 2026 Global Dorado</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>Acceso Vitalicio</span>
              <span className="text-[#FFD700]/30">•</span>
              <span>80% Comision</span>
              <span className="text-[#FFD700]/30">•</span>
              <span>Soporte VIP 24/7</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-600 mt-6">Global Dorado — Transforma el Internet en Dinero.</p>
        </div>
      </footer>
      <FloatingButtons />
    </div>
  );
}
