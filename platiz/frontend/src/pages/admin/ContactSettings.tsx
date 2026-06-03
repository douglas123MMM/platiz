import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiPhone, HiSave } from 'react-icons/hi';
import { IconTelegram } from '../../icons/PremiumIcons';

export default function ContactSettings() {
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [guias, setGuias] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings').then((r) => {
      setWhatsapp(r.data.whatsapp || '');
      setTelegram(r.data.telegram || '');
      setGuias(r.data.guias || {});
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', { whatsapp, telegram, guias });
      toast.success('Configuración guardada');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-12"><div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3">
        <HiPhone className="w-8 h-8 text-[#FFD700]" />
        <div><h1 className="section-title text-2xl">Contactos</h1><p className="section-subtitle">Configura WhatsApp, Telegram y Guias</p></div>
      </div>
      <div className="glass rounded-2xl p-6 border border-[#FFD700]/10">
        <div className="mb-6 p-4 bg-[#25D366]/10 rounded-xl flex items-center gap-3">
          <svg viewBox="0 0 24 24" className="w-10 h-10 fill-[#25D366] flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <div><p className="text-white font-medium">WhatsApp</p><p className="text-gray-400 text-xs">Los botones aparecen en la esquina inferior derecha</p></div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="label">Numero de WhatsApp</label><input className="input" placeholder="+5491123456789" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} /></div>
          <div className="p-4 bg-[#0088cc]/10 rounded-xl flex items-center gap-3">
            <IconTelegram className="w-10 h-10 text-[#0088cc]" />
            <div><p className="text-white font-medium">Telegram</p><p className="text-gray-400 text-xs">Usuario o enlace</p></div>
          </div>
          <div><label className="label">Usuario de Telegram o enlace</label><input className="input" placeholder="@usuario o https://t.me/usuario" value={telegram} onChange={(e) => setTelegram(e.target.value)} /></div>

          <div className="mt-8 pt-6 border-t border-[#FFD700]/10">
            <div className="flex items-center gap-3 mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#FFD700]"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>
              <div><p className="text-white font-medium text-lg">Guias de Precios</p><p className="text-gray-400 text-xs">Aparecen en el boton flotante de cada seccion</p></div>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-gold text-xs">PLR PRO</span>
                  <span className="text-xs text-gray-500">Visible en /plr-pro</span>
                </div>
                <textarea className="textarea min-h-[200px]" value={guias.guia_plr_pro || ''} onChange={(e) => setGuias({ ...guias, guia_plr_pro: e.target.value })} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-gold text-xs">Arsenal Digital</span>
                  <span className="text-xs text-gray-500">Visible en /services</span>
                </div>
                <textarea className="textarea min-h-[200px]" value={guias.guia_services || ''} onChange={(e) => setGuias({ ...guias, guia_services: e.target.value })} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-gold text-xs">Comunidad</span>
                  <span className="text-xs text-gray-500">Visible en /telegram</span>
                </div>
                <textarea className="textarea min-h-[200px]" value={guias.guia_telegram || ''} onChange={(e) => setGuias({ ...guias, guia_telegram: e.target.value })} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2"><HiSave className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar configuracion'}</button>
        </form>
      </div>
    </div>
  );
}
