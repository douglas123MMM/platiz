import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { User, ContentItem } from '../../types';
import { IconSearch, IconUsers, IconCourses, IconPlay } from '../../icons/PremiumIcons';
import { HiExternalLink } from 'react-icons/hi';

interface GlobalResults {
  users: User[];
  items: (ContentItem & { category_name?: string; category_icon?: string })[];
  streams: any[];
}

export default function AdminSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState<GlobalResults>({ users: [], items: [], streams: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults({ users: [], items: [], streams: [] }); return; }
    setLoading(true);
    api.get(`/streams/search?q=${encodeURIComponent(query)}`)
      .then((r) => setResults(r.data))
      .catch(() => setResults({ users: [], items: [], streams: [] }))
      .finally(() => setLoading(false));
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  const totalResults = results.users.length + results.items.length + results.streams.length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <IconSearch className="w-8 h-8 text-[#FFD700]" />
        <div>
          <h1 className="section-title text-2xl">Buscador Global</h1>
          <p className="section-subtitle">Encuentra usuarios, contenido y transmisiones</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-3 glass rounded-2xl border border-[#FFD700]/10 max-w-2xl">
        <IconSearch className="w-5 h-5 text-gray-500 flex-shrink-0" />
        <input type="text" placeholder="Buscar usuarios, películas, transmisiones..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-full" />
        <button type="submit" className="btn-primary text-sm py-2 px-5 flex-shrink-0">Buscar</button>
      </form>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin mx-auto" />
        </div>
      ) : query && totalResults === 0 ? (
        <div className="text-center py-16">
          <IconSearch className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Sin resultados para "<strong className="text-[#FFD700]">{query}</strong>"</p>
          <p className="text-gray-600 text-sm mt-2">Intenta con otros términos</p>
        </div>
      ) : (
        <div className="space-y-10">
          {results.users.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <IconUsers className="w-5 h-5 text-[#FFD700]" />
                <h2 className="text-xl font-bold text-white">Usuarios ({results.users.length})</h2>
              </div>
              <div className="glass rounded-2xl border border-[#FFD700]/10 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#FFD700]/10">
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Usuario</th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Email</th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Teléfono</th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Rol</th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[#FFD700]/60">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.users.map((user) => (
                      <tr key={user.id} className="border-b border-[#FFD700]/5 hover:bg-[#FFD700]/5 transition-colors">
                        <td className="p-4">
                          <Link to="/admin/users" className="flex items-center gap-3 hover:text-[#FFD700] transition-colors">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#DAA520] to-[#B8860B] rounded-lg flex items-center justify-center text-black font-bold text-xs">{user.username.charAt(0).toUpperCase()}</div>
                            <span className="font-medium text-white">{user.username}</span>
                          </Link>
                        </td>
                        <td className="p-4 text-gray-400 text-sm">{user.email}</td>
                        <td className="p-4 text-gray-400 text-sm">{user.phone || '—'}</td>
                        <td className="p-4"><span className={`badge ${user.role === 'admin' ? 'badge-gold' : 'badge-info'}`}>{user.role === 'admin' ? 'Admin' : 'Socio'}</span></td>
                        <td className="p-4">
                          <span className={`badge ${user.status === 'approved' ? 'badge-success' : user.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                            {user.status === 'approved' ? 'Aprobado' : user.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {results.items.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <IconCourses className="w-5 h-5 text-[#FFD700]" />
                <h2 className="text-xl font-bold text-white">Contenido ({results.items.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.items.map((item: any) => (
                  <div key={item.id} className="card group">
                    {item.image_url && (
                      <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden h-36 bg-[#0a0a0f] flex items-center justify-center rounded-t-2xl">
                        {item.video_url ? (
                          <Link to={`/player?type=item&id=${item.id}`} className="w-full h-full block relative">
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <IconPlay className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </Link>
                        ) : (
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                        )}
                      </div>
                    )}
                    <p className="text-xs text-[#FFD700]/60 mb-1">{item.category_name}</p>
                    <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
                    {item.description && <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#FFD700]/10">
                      <Link to="/admin/content" className="btn-ghost text-xs flex items-center gap-1">Editar</Link>
                      {item.video_url && (
                        <Link to={`/player?type=item&id=${item.id}`} className="btn-ghost text-xs text-[#FFD700] flex items-center gap-1 ml-auto">
                          <IconPlay className="w-3 h-3" /> Reproducir
                        </Link>
                      )}
                      {item.link && !item.video_url && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs flex items-center gap-1 ml-auto">
                          <HiExternalLink className="w-3 h-3" /> Abrir
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.streams.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <IconPlay className="w-5 h-5 text-[#FFD700]" />
                <h2 className="text-xl font-bold text-white">Transmisiones ({results.streams.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.streams.map((stream: any) => (
                  <div key={stream.id} className="card group">
                    {stream.thumbnail_url ? (
                      <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden h-36 bg-[#0a0a0f] flex items-center justify-center rounded-t-2xl">
                        <Link to={`/player?type=stream&id=${stream.id}`} className="w-full h-full block relative">
                          <img src={stream.thumbnail_url} alt={stream.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <IconPlay className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </Link>
                      </div>
                    ) : (
                      <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden h-36 bg-[#111] flex items-center justify-center rounded-t-2xl">
                        <Link to={`/player?type=stream&id=${stream.id}`} className="w-full h-full flex items-center justify-center">
                          <IconPlay className="w-10 h-10 text-[#FFD700]/30 group-hover:text-[#FFD700] transition-colors" />
                        </Link>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      {stream.platform && <span className="badge badge-gold text-xs">{stream.platform}</span>}
                      <span className={`badge text-xs ${stream.active ? 'badge-success' : 'badge-danger'}`}>{stream.active ? 'Activo' : 'Inactivo'}</span>
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">{stream.title}</h3>
                    {stream.description && <p className="text-xs text-gray-500 line-clamp-2">{stream.description}</p>}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#FFD700]/10">
                      <Link to="/admin/streams" className="btn-ghost text-xs flex items-center gap-1">Gestionar</Link>
                      <Link to={`/player?type=stream&id=${stream.id}`} className="btn-ghost text-xs text-[#FFD700] flex items-center gap-1 ml-auto">
                        <IconPlay className="w-3 h-3" /> Reproducir
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
