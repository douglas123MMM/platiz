import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import FloatingButtons from './FloatingButtons';
import { IconHome, IconMovies, IconCourses, IconBooks, IconApps, IconTelegram, IconServices, IconAcademy, IconAffiliate, IconChat, IconCog, IconPhoto, IconUsers, IconGrid, IconMenu, IconClose, IconBell, IconSearch, IconChevronDown, IconLogout } from '../icons/PremiumIcons';

const navItems = [
  { path: '/dashboard', label: 'Inicio', icon: IconHome, roles: ['client', 'admin'] },
  { path: '/movies', label: 'Entretenimiento', icon: IconMovies, roles: ['client', 'admin'] },
  { path: '/courses', label: 'Capacitación', icon: IconCourses, roles: ['client', 'admin'] },
  { path: '/books', label: 'Libros', icon: IconBooks, roles: ['client', 'admin'] },
  { path: '/apps', label: 'Aplicaciones', icon: IconApps, roles: ['client', 'admin'] },
  { path: '/telegram', label: 'Comunidad', icon: IconTelegram, roles: ['client', 'admin'] },
  { path: '/services', label: 'Arsenal Digital', icon: IconServices, roles: ['client', 'admin'] },
  { path: '/academy', label: 'Academia', icon: IconAcademy, roles: ['client', 'admin'] },
  { path: '/affiliate', label: 'Afiliación', icon: IconAffiliate, roles: ['client', 'admin'] },
  { path: '/programas', label: 'Programas', icon: IconGrid, roles: ['client', 'admin'] },
  { path: '/editables', label: 'Editables', icon: IconPhoto, roles: ['client', 'admin'] },
  { path: '/plr-pro', label: 'PLR PRO', icon: IconBooks, roles: ['client', 'admin'] },
  { path: '/chat', label: 'Chat IA', icon: IconChat, roles: ['client', 'admin'] },
  { path: '/afiliado', label: 'Afiliado', icon: IconAffiliate, roles: ['client', 'admin'] },
  { path: '/soporte', label: 'Soporte', icon: IconChat, roles: ['client', 'admin'] },
];

const adminItems = [
  { path: '/admin', label: 'Dashboard', icon: IconGrid },
  { path: '/admin/users', label: 'Usuarios', icon: IconUsers },
  { path: '/admin/content', label: 'Contenido', icon: IconCourses },
  { path: '/admin/streams', label: 'Transmisiones', icon: IconChat },
  { path: '/admin/partners', label: 'Socios', icon: IconUsers },
  { path: '/admin/contact', label: 'Contactos', icon: IconTelegram },
  { path: '/admin/affiliates', label: 'Afiliados', icon: IconAffiliate },
  { path: '/admin/banners', label: 'Banners', icon: IconPhoto },
  { path: '/admin/ai', label: 'IA Providers', icon: IconCog },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role || 'client'));

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      <aside className={`fixed top-0 left-0 z-40 h-full w-72 bg-[#050508]/90 lg:bg-[#050508]/90 backdrop-blur-xl border-r border-[#FFD700]/10 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ WebkitBackdropFilter: 'blur(24px)' }}>
        <div className="flex flex-col items-center px-3 py-3 border-b border-[#FFD700]/10">
          <Logo size={28} />
          <span className="text-[8px] text-[#FFD700]/50 uppercase tracking-[3px] mt-1">Transforma el Internet en Dinero</span>
        </div>
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-gradient-to-r from-[#FFD700]/15 to-transparent text-[#FFD700] border border-[#FFD700]/15' : 'text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/5 border border-transparent'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#FFD700]' : 'group-hover:text-[#FFD700] transition-colors'}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFD700] shadow-[0_0_6px_rgba(255,215,0,0.8)]" />}
                </Link>
              );
            })}
          </nav>

          {isAdmin && (
            <div className="px-4 pb-4">
              <div className="h-px bg-gradient-to-r from-transparent via-[#FFD700]/15 to-transparent mb-4" />
              <p className="px-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/50 mb-2">Administración</p>
              <nav className="space-y-1 max-h-44 overflow-y-auto">
                {adminItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-gradient-to-r from-[#FFD700]/15 to-transparent text-[#FFD700] border border-[#FFD700]/15' : 'text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/5 border border-transparent'}`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-[#FFD700]' : 'group-hover:text-[#FFD700] transition-colors'}`} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFD700] shadow-[0_0_6px_rgba(255,215,0,0.8)]" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </aside>

      <div className="lg:pl-72 transition-all duration-300 min-h-screen overflow-x-hidden">
        <header className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#FFD700]/10">
          <div className="flex items-center justify-between h-11 md:h-16 px-2 md:px-8 gap-0.5">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-[#FFD700]/5 text-gray-400 hover:text-[#FFD700] transition-colors flex-shrink-0">
              {sidebarOpen ? <IconClose className="w-5 h-5" /> : <IconMenu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-0.5 md:gap-2 px-1.5 md:px-4 py-1 md:py-2 bg-[#0a0a0f]/50 rounded-lg md:rounded-xl border border-[#FFD700]/10 flex-1 max-w-full md:max-w-md">
              <IconSearch className="w-3 h-3 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
              <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && searchQuery.trim()) { navigate(isAdmin ? `/admin/search?q=${encodeURIComponent(searchQuery.trim())}` : `/search?q=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(''); } }} className="bg-transparent border-none outline-none text-[11px] md:text-sm text-white placeholder-gray-500 w-full min-w-0" />
            </div>
            <div className="flex items-center gap-0.5 md:gap-2 flex-shrink-0">
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-0.5 md:gap-2 p-1 rounded-lg md:rounded-xl hover:bg-[#FFD700]/5 transition-colors">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-[#DAA520] to-[#B8860B] rounded-lg flex items-center justify-center text-black text-[10px] md:text-sm font-bold">{user?.username?.charAt(0).toUpperCase()}</div>
                  <IconChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-500 flex-shrink-0" />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-[#0a0a0f] border border-[#FFD700]/15 rounded-xl shadow-2xl shadow-black/50 z-20 overflow-hidden animate-slide-down">
                      <div className="p-4 border-b border-[#FFD700]/10">
                        <p className="text-sm font-medium text-white">{user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <button onClick={() => { logout(); navigate('/login'); setUserMenuOpen(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/5 transition-colors text-sm">
                          <IconLogout className="w-4 h-4" />
                          <span>Cerrar sesion</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      <FloatingButtons />
    </div>
  );
}
