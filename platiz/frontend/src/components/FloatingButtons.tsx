import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

const SECTION_GUIDES: Record<string, { key: string; title: string }> = {
  '/plr-pro': { key: 'guia_plr_pro', title: 'Guia PLR PRO' },
  '/services': { key: 'guia_services', title: 'Guia Arsenal Digital' },
  '/telegram': { key: 'guia_telegram', title: 'Guia Comunidad' },
};

export default function FloatingButtons() {
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [guias, setGuias] = useState<Record<string, string>>({});
  const [guideOpen, setGuideOpen] = useState(false);
  const location = useLocation();

  const currentGuide = SECTION_GUIDES[location.pathname];

  useEffect(() => {
    api.get('/settings').then((r) => {
      if (r.data.whatsapp) setWhatsapp(r.data.whatsapp);
      if (r.data.telegram) setTelegram(r.data.telegram);
      if (r.data.guias) setGuias(r.data.guias);
    }).catch(() => {});
  }, []);

  const guideText = currentGuide ? guias[currentGuide.key] || '' : '';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {currentGuide && guideText && (
        <>
          <button
            onClick={() => setGuideOpen(!guideOpen)}
            className="group relative w-14 h-14 rounded-full bg-[#FFD700] flex items-center justify-center shadow-lg shadow-[#FFD700]/30 hover:shadow-[#FFD700]/50 hover:scale-110 transition-all duration-300 touch-manipulation"
            title={currentGuide.title}
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-black"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>
            <span className="absolute right-16 bg-[#1a1a2e] text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg hidden md:block">Guia</span>
          </button>

          {guideOpen && (
            <div className="fixed inset-0 z-[90] md:inset-y-0 md:right-0 md:left-auto md:w-full md:max-w-md flex flex-col bg-[#0a0a0f] border-l border-[#FFD700]/20 shadow-2xl animate-slide-in">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#FFD700]/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">{currentGuide.title}</h3>
                    <p className="text-[#FFD700]/60 text-xs">Familia Global Dorado</p>
                  </div>
                </div>
                <button onClick={() => setGuideOpen(false)} className="text-gray-400 hover:text-white text-2xl leading-none px-2">&times;</button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{guideText}</div>
              </div>
              <div className="px-5 py-3 border-t border-[#FFD700]/10">
                <p className="text-[#FFD700]/40 text-xs text-center">Transformamos Internet en Dinero</p>
              </div>
            </div>
          )}
        </>
      )}
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:scale-110 transition-all duration-300 touch-manipulation"
          title="WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <span className="absolute right-16 bg-[#1a1a2e] text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg hidden md:block">WhatsApp</span>
        </a>
      )}
      {telegram && (
        <a
          href={telegram.startsWith('http') ? telegram : `https://t.me/${telegram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-14 h-14 rounded-full bg-[#0088cc] flex items-center justify-center shadow-lg shadow-[#0088cc]/30 hover:shadow-[#0088cc]/50 hover:scale-110 transition-all duration-300 touch-manipulation"
          title="Telegram"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.938z"/></svg>
          <span className="absolute right-16 bg-[#1a1a2e] text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg hidden md:block">Telegram</span>
        </a>
      )}
    </div>
  );
}
