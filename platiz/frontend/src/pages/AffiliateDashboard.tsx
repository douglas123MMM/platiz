import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { IconDiamond, IconUserAdd, IconChart, IconMoon, IconSun } from '../icons/PremiumIcons';

const IconCopy = () => <svg viewBox="0 0 24 24" style={{width:16,height:16,fill:'currentColor'}}><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" style={{width:16,height:16,fill:'currentColor'}}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
const IconSave = () => <svg viewBox="0 0 24 24" style={{width:16,height:16,fill:'currentColor'}}><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>;

interface Referral {
  id: string;
  status: string;
  created_at: string;
  activated_at: string | null;
  referred_user: {
    id: string;
    username: string;
    email: string;
    phone: string;
    created_at: string;
  } | null;
}

interface Stats { total: number; pendientes: number; activos: number; }
interface Links { landing: string; catalog: string; }

export default function AffiliateDashboard() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pendientes: 0, activos: 0 });
  const [links, setLinks] = useState<Links>({ landing: '', catalog: '' });
  const [credits, setCredits] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [paymentMethods, setPaymentMethods] = useState({
    binance_id: '',
    binance_email: '',
    pago_movil_bank: '',
    pago_movil_phone: '',
    pago_movil_id: '',
    zelle: '',
    otro: '',
  });
  const [copied, setCopied] = useState('');
  const [approving, setApproving] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');
  const [catalogTheme, setCatalogTheme] = useState('dark');
  const [myPrices, setMyPrices] = useState<Record<string, { price: number; label: string }>>({});
  const [catalogItems, setCatalogItems] = useState<Array<{ id: string; title: string; category_slug: string }>>([]);
  const [savingPrices, setSavingPrices] = useState(false);
  const [priceSearch, setPriceSearch] = useState('');

  useEffect(() => { fetchDashboard(); fetchPrices(); }, []);

  const fetchPrices = async () => {
    try {
      const { data } = await api.get('/affiliate/prices');
      setMyPrices(data || {});
    } catch {}
    loadCatalogItems();
  };

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/affiliate/dashboard');
      setReferrals(data.referrals);
      setStats(data.stats);
      setLinks(data.links);
      setCredits(data.profile?.credits || 0);
      setDisplayName(data.profile?.display_name || '');
      setWhatsapp(data.profile?.whatsapp || '');
      setTelegram(data.profile?.telegram_link || '');
      if (data.profile?.payment_methods) {
        const pm = typeof data.profile.payment_methods === 'string' ? JSON.parse(data.profile.payment_methods) : data.profile.payment_methods;
        setPaymentMethods({
          binance_id: pm.binance_id || '',
          binance_email: pm.binance_email || '',
          pago_movil_bank: pm.pago_movil_bank || '',
          pago_movil_phone: pm.pago_movil_phone || '',
          pago_movil_id: pm.pago_movil_id || '',
          zelle: pm.zelle || '',
          otro: pm.otro || '',
        });
      }
      setInstagram(data.profile?.instagram || '');
      setTiktok(data.profile?.tiktok || '');
      setFacebook(data.profile?.facebook || '');
      setYoutube(data.profile?.youtube || '');
      setAvatarPreview(data.profile?.avatar || '');
      setCatalogTheme(data.profile?.catalog_theme || 'dark');
    } catch {}
  };

  const copyLink = (path: string) => {
    const url = window.location.origin + path;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(path);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const approveReferral = async (referralId: string) => {
    if (credits <= 0) return;
    setApproving(referralId);
    try {
      const { data } = await api.post(`/affiliate/referrals/${referralId}/approve`);
      setCredits(data.credits_remaining);
      setMsg('Afiliado activado exitosamente');
      setTimeout(() => setMsg(''), 3000);
      fetchDashboard();
    } catch (e: any) {
      setMsg(e.response?.data?.error || 'Error al aprobar');
    } finally {
      setApproving(null);
    }
  };

  const saveProfile = async () => {
    try {
      await api.put('/affiliate/profile', {
        display_name: displayName,
        whatsapp,
        telegram_link: telegram,
        payment_methods: paymentMethods,
        instagram,
        tiktok,
        facebook,
        youtube,
        catalog_theme: catalogTheme,
      });
      if (avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        await api.put('/affiliate/profile/avatar', fd);
        setAvatarFile(null);
        setAvatarPreview('');
      }
      setMsg('Perfil guardado');
      setTimeout(() => setMsg(''), 3000);
      setEditing(false);
    } catch (e: any) {
      setMsg(e.response?.data?.error || 'Error al guardar');
    }
  };

  const loadCatalogItems = async () => {
    try {
      const { data } = await api.get('/affiliate/catalog');
      setCatalogItems((data || []).map((i: any) => ({ id: i.id, title: i.title, category_slug: i.category_slug })));
    } catch {}
  };

  const savePrices = async () => {
    setSavingPrices(true);
    try {
      await api.put('/affiliate/prices', { prices: myPrices });
      setMsg('Precios guardados correctamente');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.response?.data?.error || 'Error al guardar precios');
    }
    setSavingPrices(false);
  };

  const updatePrice = (id: string, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setMyPrices(prev => ({ ...prev, [id]: { ...prev[id], price: num, label: prev[id]?.label || '' } }));
    } else if (val === '') {
      setMyPrices(prev => { const next = { ...prev }; delete next[id]; return next; });
    }
  };

  const updateLabel = (id: string, val: string) => {
    setMyPrices(prev => ({ ...prev, [id]: { ...prev[id], price: prev[id]?.price || 0, label: val } }));
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-xl font-bold text-white mb-6">Mi Dashboard de Afiliado</h1>

      {msg && (
        <div className="mb-4 p-3 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-xl text-[#FFD700] text-sm text-center">
          {msg}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-4 text-center cursor-pointer">
          <IconDiamond className="text-[#FFD700] mx-auto" size={28} />
          <p className="text-2xl font-bold text-white">{credits}</p>
          <p className="text-xs text-gray-400">Créditos</p>
        </div>
        <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-4 text-center cursor-pointer">
          <IconUserAdd className="text-[#FFD700] mx-auto" size={28} />
          <p className="text-2xl font-bold text-white">{stats.pendientes}</p>
          <p className="text-xs text-gray-400">Pendientes</p>
        </div>
        <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-4 text-center cursor-pointer">
          <IconChart className="text-[#FFD700] mx-auto" size={28} />
          <p className="text-2xl font-bold text-white">{stats.activos}</p>
          <p className="text-xs text-gray-400">Activos</p>
        </div>
      </div>

      {credits <= 0 && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
          Sin creditos. Contacta al administrador para comprar mas licencias.
        </div>
      )}

      {/* Links Section */}
      <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-4 mb-6">
        <h2 className="text-white font-bold mb-3 text-sm">Mis Enlaces</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">Link de Captacion de Prospecto</p>
              <p className="text-sm text-[#FFD700] truncate">{window.location.origin}{links.landing}</p>
            </div>
            <button
              onClick={() => copyLink(links.landing)}
              className="ml-3 p-2 rounded-lg bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] flex-shrink-0"
            >
              {copied === links.landing ? <IconCheck /> : <IconCopy />}
            </button>
          </div>
          <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">Link de Catalogo</p>
              <p className="text-sm text-[#FFD700] truncate">{window.location.origin}{links.catalog}</p>
            </div>
            <button
              onClick={() => copyLink(links.catalog)}
              className="ml-3 p-2 rounded-lg bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] flex-shrink-0"
            >
              {copied === links.catalog ? <IconCheck /> : <IconCopy />}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-sm">Mi Perfil (visible en Catalogo)</h2>
          <button
            onClick={() => setEditing(!editing)}
            className="text-xs px-3 py-1 rounded-lg bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20"
          >
            {editing ? 'Cancelar' : (displayName || whatsapp || telegram ? 'Editar' : 'Completar Perfil')}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            {/* Foto */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#FFD700]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Foto de perfil</p>
                <input type="file" accept="image/*" ref={fileRef} className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setAvatarFile(e.target.files[0]);
                      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }} />
                <button onClick={() => fileRef.current?.click()} className="text-xs px-3 py-1.5 bg-[#FFD700]/10 text-[#FFD700] rounded-lg hover:bg-[#FFD700]/20">
                  {avatarPreview ? 'Cambiar foto' : 'Subir foto'}
                </button>
              </div>
            </div>

            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
              placeholder="Nombre de usuario / Marca" value={displayName}
              onChange={(e) => setDisplayName(e.target.value)} />
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
              placeholder="WhatsApp (ej: 584149132366 o https://wa.me/584149132366)" value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)} />
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
              placeholder="Link de Telegram (ej: https://t.me/tuusuario)" value={telegram}
              onChange={(e) => setTelegram(e.target.value)} />

            <h3 className="text-[#FFD700] text-xs font-bold pt-2">Redes Sociales</h3>
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
              placeholder="Instagram (ej: @tucuenta)" value={instagram}
              onChange={(e) => setInstagram(e.target.value)} />
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
              placeholder="TikTok (ej: @tucuenta)" value={tiktok}
              onChange={(e) => setTiktok(e.target.value)} />
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
              placeholder="Facebook (ej: /tuperfil)" value={facebook}
              onChange={(e) => setFacebook(e.target.value)} />
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
              placeholder="YouTube (ej: @tucanal)" value={youtube}
              onChange={(e) => setYoutube(e.target.value)} />

            <h3 className="text-[#FFD700] text-xs font-bold pt-2">Tema del Catalogo</h3>
            <div className="flex gap-2">
              <button type="button" onClick={() => setCatalogTheme('dark')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold ${catalogTheme === 'dark' ? 'bg-[#FFD700] text-black' : 'bg-black/30 text-gray-400 border border-[#FFD700]/10'}`}>
                <IconMoon className="inline mr-1" size={14} /> Oscuro
              </button>
              <button type="button" onClick={() => setCatalogTheme('light')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold ${catalogTheme === 'light' ? 'bg-[#FFD700] text-black' : 'bg-black/30 text-gray-400 border border-[#FFD700]/10'}`}>
                <IconSun className="inline mr-1" size={14} /> Claro
              </button>
            </div>

            <h3 className="text-[#FFD700] text-xs font-bold pt-2">Metodos de Pago</h3>
            <label htmlFor="binance_id" className="text-gray-400 text-xs">Binance</label>
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
              placeholder="ID Binance" value={paymentMethods.binance_id}
              id="binance_id"
              onChange={(e) => setPaymentMethods({...paymentMethods, binance_id: e.target.value})} />
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
              placeholder="Correo Binance" value={paymentMethods.binance_email}
              onChange={(e) => setPaymentMethods({...paymentMethods, binance_email: e.target.value})} />

            <label htmlFor="pago_movil_bank" className="text-gray-400 text-xs">Pago Movil</label>
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
              placeholder="Banco" value={paymentMethods.pago_movil_bank}
              id="pago_movil_bank"
              onChange={(e) => setPaymentMethods({...paymentMethods, pago_movil_bank: e.target.value})} />
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
              placeholder="Telefono" value={paymentMethods.pago_movil_phone}
              onChange={(e) => setPaymentMethods({...paymentMethods, pago_movil_phone: e.target.value})} />
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
              placeholder="CI / ID" value={paymentMethods.pago_movil_id}
              onChange={(e) => setPaymentMethods({...paymentMethods, pago_movil_id: e.target.value})} />

            <label htmlFor="zelle" className="text-gray-400 text-xs">Zelle / Otro</label>
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
              placeholder="Zelle" value={paymentMethods.zelle}
              id="zelle"
              onChange={(e) => setPaymentMethods({...paymentMethods, zelle: e.target.value})} />
            <input className="w-full bg-black/30 border border-[#FFD700]/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
              placeholder="Otro metodo" value={paymentMethods.otro}
              onChange={(e) => setPaymentMethods({...paymentMethods, otro: e.target.value})} />
            <button onClick={saveProfile} className="w-full py-2 bg-[#FFD700] text-black rounded-lg font-bold text-sm hover:bg-[#FFE44D]">
              Guardar Informacion
            </button>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-full bg-[#FFD700]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <div>
                {displayName && <p className="text-white font-bold">{displayName}</p>}
                {!displayName && <p className="text-gray-400 italic">Sin nombre de marca</p>}
              </div>
            </div>
            {whatsapp ? (
              <p><span className="text-gray-400">WhatsApp:</span> <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-400 underline hover:text-green-300">{whatsapp}</a></p>
            ) : (
              <p className="text-gray-400 italic">Sin WhatsApp configurado</p>
            )}
            {telegram ? (
              <p><span className="text-gray-400">Telegram:</span> <span className="text-blue-400">{telegram}</span></p>
            ) : (
              <p className="text-gray-400 italic">Sin Telegram configurado</p>
            )}

            {(instagram || tiktok || facebook || youtube) && (
              <div className="pt-1">
                <p className="text-gray-400 text-xs mb-1">Redes Sociales</p>
                {instagram && <p className="text-white text-xs"><svg className="inline w-3.5 h-3.5 mr-1 align-text-bottom" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/></svg> Instagram: {instagram}</p>}
                {tiktok && <p className="text-white text-xs"><svg className="inline w-3.5 h-3.5 mr-1 align-text-bottom" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> TikTok: {tiktok}</p>}
                {facebook && <p className="text-white text-xs"><svg className="inline w-3.5 h-3.5 mr-1 align-text-bottom" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg> Facebook: {facebook}</p>}
                {youtube && <p className="text-white text-xs"><svg className="inline w-3.5 h-3.5 mr-1 align-text-bottom" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29.94 29.94 0 001 11.75a29.94 29.94 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29.94 29.94 0 00.46-5.25 29.94 29.94 0 00-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg> YouTube: {youtube}</p>}
              </div>
            )}
            {paymentMethods.binance_id && (
              <div>
                <p className="text-gray-400 text-xs mt-2">Binance</p>
                <p className="text-white text-xs">ID: {paymentMethods.binance_id}</p>
                {paymentMethods.binance_email && <p className="text-white text-xs">{paymentMethods.binance_email}</p>}
              </div>
            )}
            {paymentMethods.pago_movil_phone && (
              <div>
                <p className="text-gray-400 text-xs mt-2">Pago Movil</p>
                <p className="text-white text-xs">{paymentMethods.pago_movil_bank} / {paymentMethods.pago_movil_phone} / {paymentMethods.pago_movil_id}</p>
              </div>
            )}
            {paymentMethods.zelle && (
              <div>
                <p className="text-gray-400 text-xs mt-2">Zelle</p>
                <p className="text-white text-xs">{paymentMethods.zelle}</p>
              </div>
            )}
            {paymentMethods.otro && (
              <div>
                <p className="text-gray-400 text-xs mt-2">Otro</p>
                <p className="text-white text-xs">{paymentMethods.otro}</p>
              </div>
            )}
            {!displayName && !whatsapp && !telegram && !paymentMethods.binance_id && !paymentMethods.pago_movil_phone && !paymentMethods.zelle && !paymentMethods.otro && (
              <p className="text-gray-400 text-center py-4">Completa tu perfil para que tus clientes vean tus datos en el catalogo.</p>
            )}
          </div>
        )}
      </div>

      {/* Prices Section */}
      <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-sm">Mis Precios (USD)</h2>
          <div className="flex gap-2">
            <button onClick={loadCatalogItems} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">Cargar productos</button>
            <button onClick={savePrices} disabled={savingPrices} className="text-xs px-3 py-1.5 rounded-lg bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20 disabled:opacity-50 transition-colors flex items-center gap-1">
              <IconSave /> {savingPrices ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
        <p className="text-gray-500 text-xs mb-3">Define el precio de venta para cada servicio. Los productos sin precio usaran el mensaje generico.</p>
        {catalogItems.length > 0 ? (
          <>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={priceSearch}
              onChange={(e) => setPriceSearch(e.target.value)}
              className="w-full mb-3 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/30"
            />
            <div className="space-y-1 max-h-80 overflow-y-auto">
            {catalogItems.filter(i => !priceSearch || i.title.toLowerCase().includes(priceSearch.toLowerCase())).map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                <span className="text-gray-300 text-xs flex-1 truncate mr-2">{item.title}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input
                    type="text"
                    maxLength={20}
                    placeholder="Completa/Perfil"
                    value={myPrices[item.id]?.label || ''}
                    onChange={(e) => updateLabel(item.id, e.target.value)}
                    className="w-20 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-[#FFD700]/40"
                  />
                  <span className="text-gray-500 text-[10px]">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="--"
                    value={myPrices[item.id]?.price || ''}
                    onChange={(e) => updatePrice(item.id, e.target.value)}
                    className="w-14 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-right focus:outline-none focus:border-[#FFD700]/40"
                  />
                </div>
              </div>
            ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-xs text-center py-4">Haz clic en "Cargar productos" para ver la lista.</p>
        )}
      </div>

      {/* Referrals Table */}
      <div className="bg-[#111] border border-[#FFD700]/10 rounded-xl p-4">
        <h2 className="text-white font-bold mb-3 text-sm">Mis Referidos ({stats.total})</h2>
        {referrals.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Aun no tienes referidos. Comparte tu link de ventas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-[#FFD700]/10">
                  <th className="text-left py-2">Usuario</th>
                  <th className="text-left py-2 hidden md:table-cell">Contacto</th>
                  <th className="text-left py-2 hidden md:table-cell">Fecha</th>
                  <th className="text-left py-2">Estado</th>
                  <th className="text-right py-2">Accion</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref.id} className="border-b border-[#FFD700]/5">
                    <td className="py-2 text-white">{ref.referred_user?.username || 'N/A'}</td>
                    <td className="py-2 text-gray-400 text-xs hidden md:table-cell">
                      {ref.referred_user?.email}<br />
                      {ref.referred_user?.phone}
                    </td>
                    <td className="py-2 text-gray-400 text-xs hidden md:table-cell">
                      {new Date(ref.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        ref.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {ref.status === 'active' ? 'Activo' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      {ref.status === 'pending' && (
                        <button
                          onClick={() => approveReferral(ref.id)}
                          disabled={credits <= 0 || approving === ref.id}
                          className={`text-xs px-3 py-1 rounded-lg font-bold ${
                            credits <= 0
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              : 'bg-[#FFD700] text-black hover:bg-[#FFE44D]'
                          }`}
                        >
                          {approving === ref.id ? '...' : 'Aprobar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
