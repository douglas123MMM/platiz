import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { CrownIcon } from '../../components/Logo';
import { IconUsers, IconCourses, IconPhoto, IconAi, IconMovies, IconChat, IconLightning, IconStar } from '../../icons/PremiumIcons';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, items: 0, banners: 0, providers: 0, pendingUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/auth/users').catch(() => ({ data: [] })),
      api.get('/content/items').catch(() => ({ data: [] })),
      api.get('/banners/all').catch(() => ({ data: [] })),
      api.get('/ai/providers').catch(() => ({ data: [] })),
    ]).then(([users, items, banners, providers]) => {
      setStats({
        users: users.data.length,
        items: items.data.length,
        banners: banners.data.length,
        providers: providers.data.length,
        pendingUsers: users.data.filter((u: any) => u.status === 'pending').length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Usuarios', value: stats.users, icon: IconUsers, color: 'from-[#FFD700]/15 to-[#DAA520]/5', textColor: 'text-[#FFD700]', href: '/admin/users' },
    { label: 'Pendientes', value: stats.pendingUsers, icon: IconStar, color: 'from-[#FFD700]/15 to-[#DAA520]/5', textColor: 'text-[#FFD700]', href: '/admin/users' },
    { label: 'Contenido', value: stats.items, icon: IconCourses, color: 'from-[#00D4FF]/15 to-[#0097A7]/5', textColor: 'text-[#00D4FF]', href: '/admin/content' },
    { label: 'Banners', value: stats.banners, icon: IconPhoto, color: 'from-purple-500/15 to-purple-600/5', textColor: 'text-purple-400', href: '/admin/banners' },
    { label: 'IA Providers', value: stats.providers, icon: IconAi, color: 'from-pink-500/15 to-pink-600/5', textColor: 'text-pink-400', href: '/admin/ai' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <CrownIcon size={48} className="drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]" />
        <div>
          <h1 className="section-title text-3xl">Panel Global Dorado</h1>
          <p className="section-subtitle">Gestiona tu imperio digital</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} to={card.href} className={`card-glow bg-gradient-to-br ${card.color} group`}>
              <Icon className={`w-8 h-8 ${card.textColor} mb-3`} />
              <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
              <p className="text-gray-400 text-sm mt-1">{card.label}</p>
            </Link>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><IconLightning className="text-[#FFD700]" /> Accesos rápidos</h3>
          <div className="space-y-3">
            {[
              { label: 'Gestionar Usuarios', href: '/admin/users', desc: 'Aprueba o rechaza nuevos socios' },
              { label: 'Gestionar Contenido', href: '/admin/content', desc: 'Añade recursos al arsenal digital' },
              { label: 'Gestionar Banners', href: '/admin/banners', desc: 'Sube imágenes promocionales' },
              { label: 'Configurar IAs', href: '/admin/ai', desc: 'Conecta ChatGPT, Gemini, Claude y más' },
              { label: 'Gestionar Transmisiones', href: '/admin/streams', desc: 'Transmisiones en vivo y videos de múltiples plataformas' },
              { label: 'Landing Afiliados', href: '/admin/landing-config', desc: 'Video, texto y configuracion de la landing de afiliados' },
            ].map((item) => (
              <Link key={item.href} to={item.href} className="flex items-center justify-between p-3 rounded-xl bg-[#111]/50 hover:bg-[#111] transition-colors group">
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-[#FFD700] transition-colors">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#111] flex items-center justify-center group-hover:bg-[#FFD700]/10 transition-colors">
                  <IconAi className="w-4 h-4 text-gray-500 group-hover:text-[#FFD700]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Estadísticas Global Dorado</h3>
          <p className="text-gray-500 text-sm">El panel de estadísticas detalladas estará disponible próximamente.</p>
          <div className="mt-6 p-4 bg-[#FFD700]/5 rounded-xl border border-[#FFD700]/10">
            <p className="text-[#FFD700] text-sm font-medium flex items-center gap-2"><IconLightning className="w-4 h-4" /> Recuerda:</p>
            <p className="text-gray-400 text-xs mt-1">Los socios ganan el 80% de comisión directa por cada venta del acceso vitalicio al sistema.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
