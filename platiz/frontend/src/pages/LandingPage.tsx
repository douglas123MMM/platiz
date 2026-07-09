import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Logo from '../components/Logo';
import FloatingButtons from '../components/FloatingButtons';
import AnimatedCounter from '../components/AnimatedCounter';
import { IconArrowRight, IconChevronDown, IconPlay, IconLightning, IconStar, IconShield, IconGlobe, IconCheck, IconUsers, IconMenu, IconClose } from '../icons/PremiumIcons';
import { SectionStreaming, SectionBooks, SectionApps, SectionServices, SectionAcademy, SectionAffiliate, IconCourses, IconChat, IconEducation, IconTools, IconRobot, IconVideo, SectionTelegram } from '../icons/PremiumIcons';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } })
};

const cardBase = 'rounded-2xl bg-[#161616] border border-[#2A2A2A] hover:border-[#E5C158]/40 transition-all duration-300';
const cardHover = 'hover:-translate-y-1 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)]';

function Reveal({ children, className = '', delay = 0, ...rest }: { children: React.ReactNode; className?: string; delay?: number; [key: string]: any }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

function LazyVideo({ video }: { video: any }) {
  const [playing, setPlaying] = useState(false);
  const getEmbedUrl = (v: any) => {
    if (v.video_type === 'youtube') { const id = v.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/); return id ? `https://www.youtube.com/embed/${id[1]}?autoplay=1` : v.video_url; }
    if (v.video_type === 'vimeo') { const id = v.video_url.match(/vimeo\.com\/(\d+)/); return id ? `https://player.vimeo.com/video/${id[1]}?autoplay=1` : v.video_url; }
    return v.video_url;
  };

  if (!playing) {
    return (
      <button onClick={() => setPlaying(true)} className="relative w-full aspect-video rounded-2xl overflow-hidden border border-[#2A2A2A] group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#E5C158]/15 flex items-center justify-center group-hover:bg-[#E5C158]/25 group-hover:scale-110 transition-all duration-300">
              <IconPlay className="w-7 h-7 text-[#E5C158] ml-0.5" />
            </div>
            <span className="text-[#E5C158]/70 text-sm font-medium group-hover:text-[#E5C158] transition-colors">Ver presentación</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-[#2A2A2A] shadow-2xl">
      <div className="relative aspect-video">
        <iframe src={getEmbedUrl(video)} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen" allowFullScreen title={video?.title} />
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#2A2A2A] last:border-b-0">
      <button onClick={() => setOpen(!open)} className="w-full py-5 flex items-center justify-between text-left group">
        <span className="text-white font-medium group-hover:text-[#E5C158] transition-colors pr-4">{question}</span>
        <span className={`text-[#E5C158] transition-transform duration-300 flex-shrink-0 ${open ? 'rotate-45' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-gray-300 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

const categoryPreviews = [
  { slug: 'movies', title: 'Entretenimiento', icon: SectionStreaming, desc: 'Streaming, música, gaming', color: 'from-red-500/20 to-orange-500/10' },
  { slug: 'apps', title: 'Aplicaciones', icon: SectionApps, desc: 'Apps móviles y web', color: 'from-cyan-500/20 to-blue-500/10' },
  { slug: 'ia', title: 'Inteligencia Artificial', icon: IconRobot, desc: 'ChatGPT, Gemini, Claude', color: 'from-purple-500/20 to-pink-500/10' },
  { slug: 'courses', title: 'Capacitación', icon: IconEducation, desc: 'Cursos y formaciones', color: 'from-emerald-500/20 to-teal-500/10' },
  { slug: 'books', title: 'Libros', icon: SectionBooks, desc: 'Biblioteca digital', color: 'from-amber-500/20 to-yellow-500/10' },
  { slug: 'services', title: 'Arsenal Digital', icon: SectionServices, desc: 'Software y licencias', color: 'from-indigo-500/20 to-violet-500/10' },
];

export default function LandingPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [landingVideos, setLandingVideos] = useState<any[]>([]);
  const [stats, setStats] = useState({ items: 170, partners: 0, categories: 18 });
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 40]);

  useEffect(() => {
    api.get('/partners/active').then((r) => { setPartners(r.data); setStats(s => ({ ...s, partners: r.data?.length || 0 })); }).catch(() => {});
    api.get('/partners/landing-videos').then((r) => setLandingVideos(r.data)).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  };

  const navLinks = [
    { label: 'Ecosistema', id: 'ecosistema' },
    { label: 'Catálogo', id: 'catalogo' },
    { label: 'Cómo Funciona', id: 'como-funciona' },
    { label: 'Comunidad', id: 'comunidad' },
    { label: 'Testimonios', id: 'testimonios' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <div className="bg-[#0A0A0A] text-white overflow-hidden">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#E5C158]/10 shadow-lg shadow-black/20' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-14 md:h-16">
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-2">
            <Logo size={22} showText={false} />
            <span className="text-xs text-[#E5C158]/80 hidden sm:inline">Global Dorado</span>
          </button>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)} className="px-3 py-1.5 text-sm text-gray-300 hover:text-[#E5C158] transition-colors rounded-lg hover:bg-white/[0.03]">
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline text-sm text-gray-300 hover:text-white transition-colors">Acceder</Link>
            <Link to="/register" className="px-4 py-1.5 bg-gradient-to-r from-[#C4A44A] to-[#E5C158] text-black text-sm font-bold rounded-lg hover:from-[#E5C158] hover:to-[#FDF8EC] transition-all duration-200">
              Comenzar Gratis
            </Link>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-1.5 text-gray-300 hover:text-white">
              {mobileMenu ? <IconClose className="w-5 h-5" /> : <IconMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#E5C158]/10 px-5 py-4 space-y-2 animate-slide-down">
            {navLinks.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)} className="block w-full text-left px-3 py-2 text-gray-300 hover:text-[#E5C158] hover:bg-white/[0.03] rounded-lg text-sm transition-colors">
                {l.label}
              </button>
            ))}
            <Link to="/login" className="block px-3 py-2 text-gray-300 hover:text-white text-sm" onClick={() => setMobileMenu(false)}>Acceder</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <motion.section id="hero" style={{ y: heroY }} className="relative min-h-screen flex items-center justify-center pt-16">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#E5C158]/3 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#00D4FF]/3 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-[#A855F7]/3 rounded-full blur-[80px]" />
          <div className="absolute inset-0 bg-gold-grid opacity-30" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, type: "spring", stiffness: 200 }}>
            <Logo size={36} showText={false} className="mx-auto mb-6" />
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-[#E5C158]/80 text-xs tracking-[0.35em] uppercase mb-5 font-medium">Ecosistema Digital de Afiliados Premium</motion.p>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 leading-[0.95]"
            style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}>
            <span className="text-white">Global </span>
            <span className="bg-gradient-to-r from-[#C4A44A] via-[#E5C158] to-[#FDF8EC] bg-clip-text text-transparent">Dorado</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="text-base md:text-lg text-gray-300 max-w-xl mx-auto mb-10 leading-relaxed">
            Ecosistema digital con acceso vitalicio. El arsenal de software y servicios digitales mas completo del mercado con oportunidades reales de ingresos por internet.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register"
              className="px-10 py-4 bg-gradient-to-r from-[#C4A44A] via-[#E5C158] to-[#A6842C] text-black font-bold rounded-xl text-base hover:from-[#E5C158] hover:via-[#FDF8EC] hover:to-[#C4A44A] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(229,193,88,0.4)] transition-all duration-200 inline-flex items-center gap-2">
              Activa Tu Oficina Virtual <IconArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login"
              className="px-10 py-4 border border-[#E5C158]/20 text-[#D1D5DB] font-medium rounded-xl text-base hover:border-[#E5C158]/40 hover:text-white transition-all duration-200">
              Acceder a Mi Panel
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { v: stats.items, l: 'Servicios Digitales', suffix: '+' },
              { v: 2600, l: 'Socios Activos', suffix: '+' },
              { v: 0, l: 'Experiencia Necesaria', suffix: '' },
              { v: 'Soporte', l: 'Garantizado', suffix: '' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 0.1 }}
                className="text-center p-5 rounded-2xl bg-[#161616] border border-[#2A2A2A]">
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#C4A44A] via-[#E5C158] to-[#FDF8EC] bg-clip-text text-transparent">
                  {typeof s.v === 'number' && s.v > 0 && s.v !== 24 ? <AnimatedCounter value={s.v} /> : s.v}{s.suffix}
                </p>
                <p className="text-xs text-gray-300 mt-1.5">{s.l}</p>
              </motion.div>
            ))}
          </motion.div>

          {landingVideos.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
              className="mt-12 max-w-2xl mx-auto">
              <LazyVideo video={landingVideos[0]} />
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
            className="mt-12">
            <button onClick={() => scrollTo('ecosistema')} className="text-[#E5C158]/40 hover:text-[#E5C158] transition-colors animate-bounce">
              <IconChevronDown className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* ECOSISTEMA DE HERRAMIENTAS */}
      <Reveal id="ecosistema" className="py-28 md:py-36">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <p className="text-[#E5C158]/70 text-xs tracking-[0.3em] uppercase mb-4">Tecnologia que Trabaja por Ti</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px' }}>
              El Ecosistema de Herramientas Automatizadas
            </h2>
            <p className="text-gray-300 max-w-lg mx-auto">Todo lo que necesitas para vender, gestionar y escalar. Sin complicaciones tecnicas.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { i: IconStar, t: 'Centro de Control', d: 'Gestiona todas tus cuentas. Visualiza fechas de ingreso, vencimiento y estado de cada servicio en un solo panel.' },
              { i: IconChat, t: 'Recordatorios Automatizados', d: 'Mensajes y alertas de cobro predefinidas. El sistema avisa a tus clientes por ti.' },
              { i: IconGlobe, t: 'Tu Maquina de Ventas', d: 'Paginas de captura, embudos profesionales y catalogo digital interactivo listos para promocionar.' },
              { i: IconTools, t: 'Tu Negocio, Tus Reglas', d: 'Personaliza precios, redes sociales, WhatsApp y canales de contacto. Tu marca, tu estilo.' },
              { i: IconLightning, t: 'Activaciones al Instante', d: 'Compra creditos en tu oficina virtual y activa usuarios de forma manual e inmediata.' },
              { i: IconShield, t: 'Entrega en Piloto Automatico', d: 'Tienda con despacho automatizado. Los servicios se entregan solos al completar la compra.' },
            ].map((f, i) => {
              const I = f.i;
              return (
                <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className={`${cardBase} ${cardHover} p-7 group`}>
                  <div className="w-11 h-11 rounded-xl bg-[#E5C158]/8 flex items-center justify-center mb-5 group-hover:bg-[#E5C158]/12 transition-colors">
                    <I className="w-5 h-5 text-[#E5C158]" />
                  </div>
                  <h3 className="text-white font-semibold text-base mb-2">{f.t}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{f.d}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* CATALOGO PREVIEW */}
      <Reveal id="catalogo" className="py-28 md:py-36">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <p className="text-[#E5C158]/70 text-xs tracking-[0.3em] uppercase mb-4">+170 Servicios Digitales</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px' }}>
              Explora Nuestro Catálogo
            </h2>
            <p className="text-gray-300 max-w-lg mx-auto">Streaming, software premium, IA, videojuegos, diseño y mucho más. Todo listo para que lo comercialices.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {categoryPreviews.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div key={cat.slug} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <Link to={`/store`}
                    className={`${cardBase} ${cardHover} p-6 flex items-center gap-4 group block`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-[#E5C158]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm group-hover:text-[#E5C158] transition-colors">{cat.title}</h3>
                      <p className="text-gray-300 text-xs mt-0.5">{cat.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          <div className="text-center">
            <a href="/store"
              className="px-10 py-4 bg-gradient-to-r from-[#C4A44A] via-[#E5C158] to-[#A6842C] text-black font-bold rounded-xl text-base hover:from-[#E5C158] hover:via-[#FDF8EC] hover:to-[#C4A44A] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(229,193,88,0.4)] transition-all duration-200 inline-flex items-center gap-2" style={{ cursor: 'pointer' }}>
              Ver Catálogo Completo <IconArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </Reveal>

      {/* COMO FUNCIONA */}
      <Reveal id="como-funciona" className="py-28 md:py-36">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-16">
            <p className="text-[#E5C158]/70 text-xs tracking-[0.3em] uppercase mb-4">Empieza en Minutos</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px' }}>
              Cómo Funciona
            </h2>
            <p className="text-gray-300 max-w-lg mx-auto">Tres pasos simples para empezar a generar ingresos digitales.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[#E5C158]/20 to-transparent" />
            {[
              { step: '01', title: 'Activa tu Oficina', desc: 'Regístrate gratis y accede a tu panel de control con todas las herramientas listas para operar.' },
              { step: '02', title: 'Elige qué Vender', desc: 'Explora 170+ servicios digitales. Streaming, IA, software, cursos. Tú decides qué promocionar.' },
              { step: '03', title: 'Gana el 80%', desc: 'Comparte tus enlaces de afiliado. Por cada venta, recibes el 80% de comisión directamente.' },
            ].map((s, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="text-center relative">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#E5C158]/15 to-[#A6842C]/10 flex items-center justify-center border border-[#E5C158]/10">
                  <span className="text-2xl font-black text-[#E5C158]" style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}>{s.step}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* PILARES DE EXITO */}
      <Reveal className="py-28 md:py-36">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <p className="text-[#E5C158]/70 text-xs tracking-[0.3em] uppercase mb-4">No Estas Solo en Esto</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px' }}>
              Tus Pilares de Exito
            </h2>
            <p className="text-gray-300 max-w-lg mx-auto">Herramientas, comunidad y un camino claro hacia ingresos reales.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { i: IconTools, t: 'El Arsenal de Marketing', d: 'Material visual, banners, guiones de venta y paginas de captura listas para promocionar la plataforma y cada uno de los 170+ servicios digitales.' },
              { i: IconUsers, t: 'Comunidad Activa', d: 'Un espacio privado de apoyo mutuo. Estrategias compartidas, soporte constante y miembros que crecen contigo. Aqui no se emprende solo.' },
              { i: IconLightning, t: 'Libertad Financiera Real', d: 'Un ecosistema practico y transparente para construir un negocio legitimo. Ingresos recurrentes desde casa, sin experiencia previa.' },
            ].map((f, i) => {
              const I = f.i;
              return (
                <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className={`${cardBase} ${cardHover} p-8 text-center group`}>
                  <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#E5C158]/15 to-[#A6842C]/10 flex items-center justify-center group-hover:from-[#E5C158]/20 transition-all">
                    <I className="w-7 h-7 text-[#E5C158]" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-3">{f.t}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{f.d}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* AI */}
      <Reveal className="py-28 md:py-36">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <p className="text-[#E5C158]/70 text-xs tracking-[0.3em] uppercase mb-4">Inteligencia Artificial</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px' }}>
            Chat con IA Integrado
          </h2>
          <p className="text-gray-300 max-w-lg mx-auto mb-10">
            Conecta con ChatGPT Plus, Gemini, Perplexity y Claude desde un solo lugar. Incluido en tu acceso vitalicio.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {['ChatGPT Plus', 'Gemini AI', 'Perplexity Pro', 'Claude AI'].map((name, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="px-6 py-2.5 rounded-full bg-[#E5C158]/5 border border-[#E5C158]/10 text-[#E5C158] text-sm font-medium">
                {name}
              </motion.span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* COMUNIDAD TELEGRAM */}
      <Reveal id="comunidad" className="py-28 md:py-36">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <p className="text-[#E5C158]/70 text-xs tracking-[0.3em] uppercase mb-4">Comunidad Exclusiva</p>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0088cc]/10 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#0088cc">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/>
            </svg>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px' }}>
            Únete a Nuestra Comunidad <span className="bg-gradient-to-r from-[#0088cc] to-[#00aaff] bg-clip-text text-transparent">Telegram</span>
          </h2>
          <p className="text-gray-300 max-w-lg mx-auto mb-6">
            Accede a canales VIP con soporte directo, contenido exclusivo, estrategias de venta y una red de socios que crece contigo.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {['Soporte Directo', 'Contenido Exclusivo', 'Estrategias de Venta', 'Networking', 'Actualizaciones', 'Tutoriales'].map((tag, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="px-4 py-1.5 rounded-full bg-[#0088cc]/5 border border-[#0088cc]/10 text-[#0088cc] text-xs font-medium">
                {tag}
              </motion.span>
            ))}
          </div>
          <a href="https://t.me/globaldoradosoporte" target="_blank" rel="noopener noreferrer"
            className="px-10 py-4 bg-[#0088cc] hover:bg-[#00aaff] text-white font-bold rounded-xl text-base hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,136,204,0.4)] transition-all duration-200 inline-flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>
            Unirme a Telegram
          </a>
          <p className="text-gray-300 text-xs mt-4">Más de 500 socios activos compartiendo estrategias a diario</p>
        </div>
      </Reveal>

      {/* TESTIMONIALS */}
      <Reveal id="testimonios" className="py-28 md:py-36">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-[#E5C158]/70 text-xs tracking-[0.3em] uppercase mb-4">Testimonios</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px' }}>
              Lo que dicen nuestros socios
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: 'Maria G.', r: 'Socia Activa', t: 'Con Global Dorado aprendi a vender servicios digitales. Ya tengo 15 clientes fijos y gano en dolares desde casa.' },
              { n: 'Carlos R.', r: 'Afiliado', t: 'La capacitacion me ayudo a entender el negocio. El soporte es real, siempre me resuelven las dudas.' },
              { n: 'Ana L.', r: 'Lider', t: 'Empece sin saber nada y hoy tengo mi propio equipo. Global Dorado cambio mi vida financiera.' }
            ].map((t, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className={`${cardBase} ${cardHover} p-7`}>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(n => <span key={n} className="text-[#E5C158] text-xs">★</span>)}
                </div>
                <p className="text-[#D1D5DB] text-sm mb-6 leading-relaxed italic">"{t.t}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E5C158]/10 flex items-center justify-center text-xs font-bold text-[#E5C158]">{t.n.charAt(0)}</div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.n}</p>
                    <p className="text-gray-300 text-xs">{t.r}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* FAQ */}
      <Reveal id="faq" className="py-28 md:py-36">
        <div className="max-w-2xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-[#E5C158]/70 text-xs tracking-[0.3em] uppercase mb-4">Resolvemos tus dudas</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px' }}>
              Preguntas Frecuentes
            </h2>
          </div>
          <div className={`${cardBase} p-6 md:p-8`}>
            {[
              { q: '¿Necesito experiencia previa para empezar?', a: 'No. Global Dorado está diseñado para principiantes. Te damos capacitación, material de marketing y soporte directo. Solo necesitas acceso a internet y ganas de aprender.' },
              { q: '¿Cómo recibo mis ganancias?', a: 'Ganas el 80% de cada venta que generes con tus enlaces de afiliado, directo a tu cuenta.' },
              { q: '¿Qué incluye el acceso vitalicio?', a: 'Un pago único te da acceso de por vida a: 170+ servicios digitales para vender, centro de control, páginas de captura, catálogo interactivo, comunidad privada, soporte directo, IA integrada y actualizaciones constantes.' },
              { q: '¿Hay soporte si tengo dudas?', a: 'Sí. Contamos con soporte directo a través de WhatsApp y nuestra comunidad de Telegram. Además, tendrás acceso a capacitaciones y guías paso a paso.' },
              { q: '¿Puedo vender desde cualquier país?', a: 'Sí. Global Dorado opera 100% online. Puedes vender desde cualquier país de Latinoamérica y el mundo. Los servicios son digitales, se entregan al instante.' },
              { q: '¿Es seguro? ¿Hay garantía?', a: 'Totalmente. Somos un ecosistema establecido con cientos de socios activos. Tu oficina virtual es privada y segura. Si tienes algún inconveniente, nuestro equipo te responde de inmediato.' },
            ].map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </Reveal>

      {/* SOCIOS */}
      {partners.length > 0 && (
        <Reveal className="py-28 md:py-36">
          <div className="max-w-5xl mx-auto px-5">
            <div className="text-center mb-14">
              <p className="text-[#E5C158]/70 text-xs tracking-[0.3em] uppercase mb-4">Equipo</p>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px' }}>
                Nuestros Socios
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {partners.map((p: any, i: number) => (
                <motion.div key={p.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className={`${cardBase} ${cardHover} p-6 text-center`}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-[#E5C158]/10">
                    {p.photo_url ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-[#E5C158]/10 flex items-center justify-center text-lg font-bold text-[#E5C158]">{p.name.charAt(0)}</div>}
                  </div>
                  <p className="text-white text-sm font-medium">{p.name}</p>
                  {p.role && <p className="text-gray-300 text-xs mt-1">{p.role}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* CTA FINAL */}
      <Reveal className="py-32 md:py-44 text-center">
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="text-3xl md:text-6xl font-extrabold text-white mb-6 tracking-tight" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", letterSpacing: '1px', textShadow: '0 0 40px rgba(229,193,88,0.1)' }}>
            Tienes las herramientas. Tienes el material. Tienes la comunidad.
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-md mx-auto">
            Solo falta que actives tu oficina virtual y empieces a generar ingresos hoy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register"
              className="px-12 py-4.5 bg-gradient-to-r from-[#C4A44A] via-[#E5C158] to-[#A6842C] text-black font-bold rounded-xl text-lg hover:from-[#E5C158] hover:via-[#FDF8EC] hover:to-[#C4A44A] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(229,193,88,0.4)] transition-all duration-200 inline-flex items-center gap-2">
              Activar Mi Oficina Ahora <IconArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login"
              className="px-12 py-4.5 border border-[#E5C158]/20 text-[#D1D5DB] font-medium rounded-xl text-lg hover:border-[#E5C158]/40 hover:text-white transition-all duration-200">
              Ya Tengo Cuenta
            </Link>
          </div>
        </div>
      </Reveal>

      <footer className="border-t border-[#1F2937] py-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo size={20} />
            <span className="text-xs text-gray-300">© 2026 Global Dorado</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-300">
            <span>Acceso Vitalicio</span><span>·</span><span>80% Comision</span><span>·</span><span>Soporte Garantizado</span>
          </div>
        </div>
      </footer>

      <FloatingButtons />
    </div>
  );
}
