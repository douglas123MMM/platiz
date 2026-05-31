import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { HiMenu, HiX, HiHome, HiFilm, HiBookOpen, HiPaperAirplane, HiCog, HiChat, HiAcademicCap, HiPhotograph, HiUsers, HiLogout, HiChevronDown, HiBell, HiSearch, HiViewGrid, HiLightningBolt, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { FiServer, FiShield } from 'react-icons/fi';

const navItems = [
  { path: '/dashboard', label: 'Inicio', icon: HiHome, roles: ['client', 'admin'] },
  { path: '/movies', label: 'Entretenimiento', icon: HiFilm, roles: ['client', 'admin'] },
  { path: '/courses', label: 'Capacitación', icon: HiBookOpen, roles: ['client', 'admin'] },
  { path: '/books', label: 'Libros', icon: HiBookOpen, roles: ['client', 'admin'] },
  { path: '/apps', label: 'Aplicaciones', icon: HiLightningBolt, roles: ['client', 'admin'] },
  { path: '/telegram', label: 'Comunidad', icon: HiPaperAirplane, roles: ['client', 'admin'] },
  { path: '/services', label: 'Arsenal Digital', icon: FiServer, roles: ['client', 'admin'] },
  { path: '/academy', label: 'Academia', icon: HiAcademicCap, roles: ['client', 'admin'] },
  { path: '/chat', label: 'Chat IA', icon: HiChat, roles: ['client', 'admin'] },
];

const adminItems = [
  { path: '/admin', label: 'Dashboard', icon: HiViewGrid },
  { path: '/admin/users', label: 'Usuarios', icon: HiUsers },
  { path: '/admin/content', label: 'Contenido', icon: HiBookOpen },
  { path: '/admin/banners', label: 'Banners', icon: HiPhotograph },
  { path: '/admin/ai', label: 'IA Providers', icon: HiCog },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [navPage, setNavPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role || 'client'));
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(filteredNav.length / ITEMS_PER_PAGE);
  const paginatedNav = filteredNav.slice(navPage * ITEMS_PER_PAGE, (navPage + 1) * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <aside className={`fixed top-0 left-0 z-40 h-full w-72 bg-[#050508]/90 backdrop-blur-xl border-r border-[#FFD700]/10 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col items-center px-3 py-3 border-b border-[#FFD700]/10">
          <Logo size={28} />
          <span className="text-[8px] text-[#FFD700]/50 uppercase tracking-[3px] mt-1">Transforma el Internet en Dinero</span>
        </div>
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {paginatedNav.map((item) => {
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
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pb-4">
              <button onClick={() => setNavPage(Math.max(0, navPage - 1))} disabled={navPage === 0} className="p-1.5 rounded-lg text-gray-500 hover:text-[#FFD700] hover:bg-[#FFD700]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <HiChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setNavPage(i)} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === navPage ? 'w-6 bg-[#FFD700] shadow-[0_0_6px_rgba(255,215,0,0.6)]' : 'bg-white/20 hover:bg-white/40'}`} />
              ))}
              <button onClick={() => setNavPage(Math.min(totalPages - 1, navPage + 1))} disabled={navPage === totalPages - 1} className="p-1.5 rounded-lg text-gray-500 hover:text-[#FFD700] hover:bg-[#FFD700]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <HiChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
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

      <div className={`lg:pl-72 transition-all duration-300`}>
        <header className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#FFD700]/10">
          <div className="flex items-center justify-between h-16 px-4 md:px-8">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-[#FFD700]/5 text-gray-400 hover:text-[#FFD700] transition-colors">
              {sidebarOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-[#0a0a0f]/50 rounded-xl border border-[#FFD700]/10 w-full max-w-md">
              <HiSearch className="w-5 h-5 text-gray-500" />
              <input type="text" placeholder="Buscar en Global Dorado..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && searchQuery.trim()) { navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(''); } }} className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-full" />
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-[#FFD700]/5 text-gray-400 hover:text-[#FFD700] transition-colors">
                <HiBell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FFD700] rounded-full shadow-[0_0_6px_rgba(255,215,0,0.8)]"></span>
              </button>
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#FFD700]/5 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#DAA520] to-[#B8860B] rounded-lg flex items-center justify-center text-black text-sm font-bold">{user?.username?.charAt(0).toUpperCase()}</div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">{user?.username}</p>
                    <p className="text-xs text-[#FFD700]/60">{user?.role === 'admin' ? 'Administrador' : 'Socio'}</p>
                  </div>
                  <HiChevronDown className="w-4 h-4 text-gray-500" />
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
                          <HiLogout className="w-4 h-4" />
                          <span>Cerrar sesión</span>
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
    </div>
  );
}
