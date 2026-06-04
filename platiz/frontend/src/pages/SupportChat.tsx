import { useState, useRef, useEffect } from 'react';
import { IconSend, IconChat } from '../icons/PremiumIcons';
import api from '../services/api';

// v3 - Jun 2026

const KB: { keywords: string[]; answer: string }[] = [
  // STREAMING
  {
    keywords: ['netflix'],
    answer: `NETFLIX
- Pantalla Extra: 5.99 USDT
- Cuenta Premium 4K con Bot: 14 USDT
- 1 Pantalla Premium: consultar (aprox 3.8 USDT)`,
  },
  {
    keywords: ['disney', 'disney+', 'disney plus'],
    answer: `DISNEY PLUS
- Perfil: 1.7 USDT
- Completa con Bot: 9.5 USDT`,
  },
  {
    keywords: ['hbo', 'hbo max'],
    answer: `HBO MAX
- 1 pantalla: 1.5 USDT
- Completa: 3 USDT`,
  },
  {
    keywords: ['prime', 'amazon', 'amazon prime'],
    answer: `AMAZON PRIME
- 1 pantalla: 1.5 USDT
- Completa: 3 USDT`,
  },
  {
    keywords: ['paramount', 'paramount+'],
    answer: `PARAMOUNT+
- Perfil: 1.5 USDT
- Completa: 3 USDT`,
  },
  {
    keywords: ['crunchyroll', 'anime'],
    answer: `CRUNCHYROLL
- Perfil: 1.5 USDT
- Completa: 3 USDT`,
  },
  {
    keywords: ['vix', 'vix+'],
    answer: `VIX PLUS
- Perfil: 1.7 USDT
- Completa: 3 USDT`,
  },
  {
    keywords: ['magistv', 'flujo', 'flujotv', 'magis'],
    answer: `MAGISTV / FLUJOTV
- Consultar precio actualizado. Contacta al admin.`,
  },
  {
    keywords: ['flujo+', 'flujo plus', 'flujo+ plus', 'flujo mas'],
    answer: `FLUJO+ | Entretenimiento Sin Limites

Links de Descarga:
- Link directo (APK): https://dwnapp.lat/flujo.apk
- Codigo Downloader: 3930005

Que ofrece:
- +3,000 canales en vivo de alta estabilidad
- +22,000 peliculas en todas las calidades
- +3,000 series con actualizaciones diarias
- Netflix, HBO, Disney, Apple TV y Amazon Prime en una sola app
- Todos los eventos y campeonatos deportivos en vivo

Compatibilidad:
- Dispositivos moviles Android y Smart TV

Planes y Precios:
- 1 Dispositivo: 1.5 USDT
- 3 Dispositivos: 2.5 USDT
- 5 Dispositivos: 4 USDT

Para contratar escribe al WhatsApp: https://wa.me/584149132366`,
  },
  {
    keywords: ['youtube', 'youtube premium'],
    answer: `YOUTUBE PREMIUM
- Consultar precio actualizado. Contacta al admin.`,
  },
  {
    keywords: ['apple tv'],
    answer: `APPLE TV
- Completa: 3.00 USDT`,
  },
  {
    keywords: ['apple music', 'applemusic'],
    answer: `APPLE MUSIC
- Familiar: 3.11 USDT`,
  },
  {
    keywords: ['viki', 'viki rakuten'],
    answer: `VIKI RAKUTEN
- 1 pantalla: 2 USDT`,
  },
  {
    keywords: ['mubi', 'curiosity', 'curiosity stream'],
    answer: `MUBI / CURIOSITY STREAM
- 1 pantalla: 1.72 USDT`,
  },

  // IA
  {
    keywords: ['chatgpt', 'gpt', 'openai'],
    answer: `CHATGPT PLUS
- A dominio (correo nuevo): 8 USDT
- Alquiler: 7.5 USDT
- Perfil/Completa: consultar

CHATGPT GO
- 1 disp (1 mes): 2.38 USDT
- 1 disp (2 meses): 3.66 USDT
- 1 disp (3 meses): 4.22 USDT
- Completa: consultar`,
  },
  {
    keywords: ['jarvis', 'jarvis ia'],
    answer: `JARVIS IA
- Completa: 3.11 USDT
- 1 pantalla: 1.83 USDT`,
  },
  {
    keywords: ['gemini', 'google one', 'gemini pro'],
    answer: `GOOGLE ONE + GEMINI PRO
- 1 mes 1 pantalla Compartido: 2. USDT
- 1 mes Completa 5 disp: 4.22 USDT
- Ano completa: 13 USDT
- 1 mes al correo del cliente: 3.67 USDT`,
  },
  {
    keywords: ['grok', 'grok ai', 'grok super'],
    answer: `GROK SUPER AI
- Completa (7 dias): 3.11 USDT
- Compartida (7 dias): 2.05 USDT`,
  },
  {
    keywords: ['perplexity', 'perplexity pro'],
    answer: `PERPLEXITY PRO
- 1 mes: 5.00 USDT
- 3 meses: 10.89 USDT
- 6 meses: 19.22 USDT
- 1 ano: 27.56 USDT
- Compartida 1 disp: Desde 2.56 USDT`,
  },
  {
    keywords: ['gamma', 'gamma app'],
    answer: `GAMMA APP AI PLUS
- Completa: 22 USDT
- 1 pantalla: 4.22 USDT`,
  },
  {
    keywords: ['adobe', 'photoshop', 'express'],
    answer: `ADOBE
- Photoshop Web 1 pantalla: 3.5 USDT
- Adobe Express 1 pantalla: 3.20 USDT`,
  },
  {
    keywords: ['freepik', 'freepik ai'],
    answer: `FREEPIK AI PREMIUM
- 1 disp: 5.77 USDT`,
  },
  {
    keywords: ['prezi', 'prezi ai'],
    answer: `PREZI AI PLUS
- 1 pantalla: 2.38 USDT
- Completa: 4.66 USDT`,
  },
  {
    keywords: ['beautiful ai', 'beautifulai'],
    answer: `BEAUTIFUL AI
- 1 pantalla: 1.72 USDT`,
  },
  {
    keywords: ['uizard', 'uizard pro'],
    answer: `UIZARD PRO
- 1 pantalla: 2.72 USDT`,
  },
  {
    keywords: ['blackbox', 'black box'],
    answer: `BLACKBOX PRO MAX
- 1 pantalla: 2.94 USDT
- Completa: 5.99 USDT`,
  },
  {
    keywords: ['wispr', 'wispr flow'],
    answer: `WISPR FLOW AI
- 3.11 USDT`,
  },
  {
    keywords: ['grammarly'],
    answer: `GRAMMARLY PRO
- Desde 1.83 USDT`,
  },
  {
    keywords: ['pixlr'],
    answer: `PIXLR PREMIUM: 3.66 USDT`,
  },
  {
    keywords: ['jasper', 'jasper ai'],
    answer: `JASPER AI PRO
- 7 dias: 7.55 USDT`,
  },
  {
    keywords: ['devclub', 'dev club'],
    answer: `DEVCLUB STORE
- 1 pantalla: 4.33 USDT`,
  },
  {
    keywords: ['claude', 'claude pro'],
    answer: `CLAUDE PRO
- Consultar precio actualizado.`,
  },
  {
    keywords: ['linear'],
    answer: `LINEAR
- Consultar precio actualizado.`,
  },
  {
    keywords: ['leonardo', 'leonardo.ai', 'leonardoai'],
    answer: `LEONARDO.AI PREMIUM
- Consultar precio actualizado.`,
  },
  {
    keywords: ['trading', 'trading view', 'tradingview'],
    answer: `TRADINGVIEW PLUS
- 1 pantalla Sin garantia: 2.27 USDT
- 1 pantalla Garantia 7 dias: 3.66 USDT`,
  },

  // CREATIVIDAD
  {
    keywords: ['canva', 'canva pro'],
    answer: `CANVA PRO
- Correo del cliente: 2 USDT (ANO)
- Revendedor: consultar
- Cuenta Madre (500 cuentas) 3 ANOS: 30 USDT`,
  },
  {
    keywords: ['capcut', 'capcut pro'],
    answer: `CAPCUT PRO
- Cuenta Completa: 8 USDT (consultar)
- 1 Dispositivo: 5 USDT
- Capcut Team: consultar`,
  },

  // MUSICA
  {
    keywords: ['spotify', 'musica'],
    answer: `SPOTIFY
- Consultar precio actualizado. Contacta al admin.`,
  },

  // LECTURA / EDUCACION
  {
    keywords: ['scribd', 'everand'],
    answer: `SCRIBD + EVERAND: 1.85 USDT`,
  },
  {
    keywords: ['duolingo', 'idioma', 'idiomas'],
    answer: `DUOLINGO SUPER: 1.72 USDT`,
  },
  {
    keywords: ['bookmate'],
    answer: `BOOKMATE: 1.72 USDT`,
  },
  {
    keywords: ['storytel'],
    answer: `STORYTEL: 1.94 USDT`,
  },
  {
    keywords: ['nextory'],
    answer: `NEXTORY
- 1 pantalla: 1.88 USDT`,
  },
  {
    keywords: ['busuu'],
    answer: `BUSUU: 1.83 USDT`,
  },
  {
    keywords: ['fluentu', 'talkpal'],
    answer: `FLUENTU / TALKPAL
- 14 dias: 2.05 USDT`,
  },
  {
    keywords: ['dino', 'dinolingo', 'lingopie', 'talkio'],
    answer: `DINOLINGO / LINGOPIE / TALKIO: 1.83 USDT`,
  },
  {
    keywords: ['all you can books', 'allyoucanbooks'],
    answer: `ALL YOU CAN BOOKS: 1.72 USDT`,
  },
  {
    keywords: ['aprendizaje', 'lectura', 'libros'],
    answer: `LECTURA Y APRENDIZAJE
- Scribd + Everand: 1.85 USDT
- Duolingo Super: 1.72 USDT
- Storytel: 1.94 USDT
- Nextory: 1.88 USDT
- Bookmate: 1.72 USDT
- All You Can Books: 1.72 USDT
- Fluentu / Talkpal: 2.05 USDT
- Busuu: 1.83 USDT
- DinoLingo / LingoPie / Talkio: 1.83 USDT`,
  },

  // VPN
  {
    keywords: ['vpn', 'surfshark', 'nord', 'express vpn', 'expressvpn', 'avira', 'tuxler', 'potato', 'proton', 'hma'],
    answer: `VPNS Y ANTIVIRUS
- Surfshark VPN 1 mes: 2 USDT / Completa: 5.33 USDT
- Express VPN 1 mes: 2.39 USDT
- Nord VPN 1 mes: 2.88 USDT
- VPN Economicas (Potato/Proton/HMA): Desde 1.61 USDT
- Avira Antivirus 3 meses: 5.55 USDT
- VPN Residencial Tuxler: consultar`,
  },

  // PRODUCTIVIDAD
  {
    keywords: ['zoom'],
    answer: `ZOOM
- 14 dias: 1.61 USDT`,
  },
  {
    keywords: ['photoroom', 'photoroom max'],
    answer: `PHOTOROOM MAX: 1.72 USDT`,
  },
  {
    keywords: ['studocu'],
    answer: `STUDOCU: 2.16 USDT`,
  },
  {
    keywords: ['cam scanner', 'camscanner'],
    answer: `CAM SCANNER: 2.77 USDT`,
  },
  {
    keywords: ['miro', 'miro ai'],
    answer: `MIRO AI PREMIUM: 2.05 USDT`,
  },
  {
    keywords: ['picsart'],
    answer: `PICSART PREMIUM: 2.88 USDT`,
  },
  {
    keywords: ['meitu'],
    answer: `MEITU: 1.83 USDT`,
  },
  {
    keywords: ['videoideas', 'videoideas.ai'],
    answer: `VIDEOIDEAS.AI: 1.95 USDT`,
  },
  {
    keywords: ['mindstudio', 'mindstudio plus'],
    answer: `MINDSTUDIO PLUS: 3.66 USDT`,
  },
  {
    keywords: ['productividad'],
    answer: `PRODUCTIVIDAD
- Zoom 14 dias: 1.61 USDT
- Photoroom Max: 1.72 USDT
- Meitu: 1.83 USDT
- Studocu: 2.16 USDT
- Videoideas.ai: 1.95 USDT
- Cam Scanner: 2.77 USDT
- Miro AI Premium: 2.05 USDT
- Mindstudio Plus: 3.66 USDT
- Picsart Premium: 2.88 USDT`,
  },

  // WHATSAPP CRM
  {
    keywords: ['whatsapp', 'crm', 'black crm'],
    answer: `BLACK CRM (SOFTWARE WHATSAPP)
- 1 mes: 5.99 USDT
- 3 meses: 16 USDT
- 1 ano: 25 USDT
- Pack Revendedor (10 licencias): 27 USDT`,
  },

  // APPS
  {
    keywords: ['app', 'aplicacion', 'personalizada', 'iptv', 'tv box', 'netflix app', 'propia app'],
    answer: `APP PERSONALIZADA TIPO NETFLIX/IPTV
Creamos tu propia app de streaming con panel y creditos incluidos.

Precio: 60 USDT
- App personalizada
- Panel de administracion
- Creditos incluidos
- Diseno profesional
- Ideal para TV Box, Android, Fire TV

Pedidos: WhatsApp +584149132366`,
  },

  // NAVEGACION
  {
    keywords: ['soporte', 'ayuda', 'canal de soporte', 'asistencia', 'atencion'],
    answer: `CANAL DE SOPORTE
Ya estas en el! Este chat es nuestro canal de soporte oficial.

Tambien puedes contactarnos por:
- WhatsApp: https://wa.me/584149132366
- Grupo de Revendedores: https://chat.whatsapp.com/FSpoFak5Txg6OVNg6RWbGv
- Menu lateral: explora PLR PRO, Arsenal Digital, Comunidad`,
  },
  {
    keywords: ['grupo', 'comunidad', 'aprobaciones', 'grupo de aprobaciones', 'revendedores'],
    answer: `GRUPO DE REVENDEDORES / APROBACIONES
Unete al grupo oficial:
https://chat.whatsapp.com/FSpoFak5Txg6OVNg6RWbGv

Ahi recibes:
- Aprobaciones de pago
- Promociones exclusivas
- Soporte directo
- Nuevos productos

Tambien visita la seccion "Comunidad" en el menu lateral.`,
  },
  {
    keywords: ['seccion', 'secciones', 'menu', 'navegar', 'donde', 'ubicado', 'encontrar', 'pagina', 'web', 'sitio'],
    answer: `SECCIONES DEL SITIO
Usa el menu lateral (icono de 3 rayas arriba a la izquierda):

- PLR PRO: +190 guias y plantillas con derechos de reventa
- Arsenal Digital: servicios de streaming, IA, VPN y mas
- Comunidad: enlaces y recursos para revendedores
- Soporte: este chat para consultas y pedidos
- Chat IA: asistente inteligente para cotizaciones`,
  },

  // GENERAL
  {
    keywords: ['precio', 'precios', 'cuesta', 'cuanto', 'cuánto', 'catalogo', 'lista'],
    answer: `CATALOGO GLOBAL DORADO

STREAMING: Netflix 3.8-14 | Disney 1.7-9.5 | HBO 1.5-3 | Prime 1.5-3 | Paramount 1.5-3 | Crunchyroll 1.5-3 | Vix 1.7-3 | Apple TV 3 | MUBI 1.72 | Viki 2

IA: ChatGPT 2.38-8 | Gemini Pro 2-13 | Grok 2.05-3.11 | Perplexity 2.56-27.56 | Jarvis 1.83-3.11 | Gamma 4.22-22 | TradingView 2.27-3.66

CREATIVIDAD: Canva Pro 2/a | CapCut 5-8 | Adobe 3.2-3.5 | Freepik 5.77

VPN: Surfshark 2 | Nord 2.88 | Express 2.39 | Economicas desde 1.61

Pregunta por un producto especifico para ver el precio detallado.`,
  },
  {
    keywords: ['bolivar', 'bolivares', 'bs', 'ves', 'tasa', 'cambio', 'dolar hoy'],
    answer: `CONVERSION A BOLIVARES
Multiplica el precio en USDT por la tasa del dia.
Revisa la tasa en: https://alcambio.app`,
  },
  {
    keywords: ['binance', 'usdt', 'cripto', 'pago', 'pagar', 'metodo', 'transferencia', 'movil', 'zelle'],
    answer: `METODOS DE PAGO
- Binance (USDT) - ID: 355976674 - jcespinoza2011@gmail.com
- Pago movil: 0102 / 04243057148 / 28012172
- Transferencia bancaria (Bs)

Tiempo de entrega: 5-10 minutos`,
  },
  {
    keywords: ['contacto', 'contactar', 'admin', 'whatsapp', 'telegram', 'hablar', 'escribir'],
    answer: `CONTACTO
WhatsApp: https://wa.me/584149132366
Grupo de Revendedores: https://chat.whatsapp.com/FSpoFak5Txg6OVNg6RWbGv
Atendemos rapido.`,
  },
  {
    keywords: ['garantia', 'entrega', 'envio', 'recibir', 'acceso', 'tiempo'],
    answer: `ENTREGA Y GARANTIA
- Tiempo: 5-10 minutos
- Soporte por WhatsApp/Telegram
- Servicio seguro y confiable`,
  },
  {
    keywords: ['revendedor', 'revender', 'reventa', 'pack revendedor'],
    answer: `PROGRAMA DE REVENDEDORES
Vende todos nuestros servicios. Precios especiales para revendedores.
Grupo: https://chat.whatsapp.com/FSpoFak5Txg6OVNg6RWbGv`,
  },
  {
    keywords: ['plr', 'guia', 'guias', 'plantilla', 'plantillas', 'ebook', 'mockup', 'kit de marca'],
    answer: `PLR PRO - +190 productos con derechos de reventa
Visita la seccion PLR PRO en el menu lateral para ver todas las guias y plantillas.`,
  },
  {
    keywords: ['licencia', 'licencias', 'programa', 'programas', 'software', 'instalacion'],
    answer: `LICENCIAS E INSTALACION
Consultar precio del programa. Instalacion via AnyDesk/UltraViewer.
Contacto: WhatsApp +584149132366`,
  },
];

function findAnswer(msg: string): string {
  const lower = msg.toLowerCase();
  
  // Buscar coincidencia exacta de producto primero
  const productMatches: string[] = [];
  for (const entry of KB) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw) && kw.length > 3) {
        productMatches.push(kw);
      }
    }
  }

  // Si la pregunta es muy corta o generica, dar guia
  if (lower.length < 5 || lower === 'precios' || lower === 'catalogo' || lower === 'lista') {
    const catalog = KB.find(e => e.keywords.includes('catalogo'));
    return catalog?.answer || 'Escribe el nombre del producto que buscas. Ej: Netflix, ChatGPT, Canva, Office...';
  }

  // Si encontro productos especificos, mostrar solo esos
  if (productMatches.length === 1) {
    // Producto unico - buscar su entrada exacta
    for (const entry of KB) {
      if (entry.keywords.includes(productMatches[0])) {
        return entry.answer;
      }
    }
  }

  if (productMatches.length >= 2) {
    // Multiples productos mencionados
    const answers: string[] = [];
    const seen = new Set<string>();
    for (const entry of KB) {
      for (const kw of entry.keywords) {
        if (productMatches.includes(kw) && !seen.has(entry.answer)) {
          seen.add(entry.answer);
          answers.push(entry.answer);
        }
      }
    }
    if (answers.length === 1) return answers[0];
    if (answers.length >= 2) return answers.slice(0, 3).join('\n\n---\n\n');
  }

  // Si no encontro nada especifico, buscar por mejor coincidencia de keywords
  let bestMatch: { answer: string; score: number } | null = null;
  for (const entry of KB) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) score += kw.length > 4 ? 3 : 1;
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { answer: entry.answer, score };
    }
  }

  if (bestMatch) return bestMatch.answer;

  return `No tengo informacion sobre "${msg}".\n\nPrueba preguntando por:\n- Netflix, Disney, HBO, Prime, YouTube\n- ChatGPT, Gemini, Canva, CapCut\n- Spotify, Duolingo, VPN\n- precios, bolivares, binance, licencias\n\nO contacta al admin por WhatsApp.`; // Devolver vacio para que intente IA
}

function renderText(text: string): React.ReactNode {
  let parts = text.split(/(https?:\/\/[^\s]+)/g);
  
  // Auto-detectar dominios conocidos sin https://
  const domainRegex = /(?:^|\s)((?:chat\.whatsapp\.com|wa\.me|alcambio\.app|dwnapp\.lat|t\.me)\/[^\s]*)/gi;
  const enriched: string[] = [];
  for (const part of parts) {
    if (/^https?:\/\//.test(part)) {
      enriched.push(part); // ya tiene https://
    } else {
      // Buscar dominios sin https:// dentro de texto normal
      let remaining = part;
      while (domainRegex.test(remaining)) {
        domainRegex.lastIndex = 0; // reset para exec
        const match = domainRegex.exec(remaining);
        if (!match) break;
        const before = remaining.slice(0, match.index + (remaining[match.index] === ' ' ? 1 : 0));
        const domain = match[1];
        enriched.push(before);
        enriched.push('https://' + domain);
        remaining = remaining.slice(match.index + (remaining[match.index] === ' ' ? 1 : 0) + domain.length);
        domainRegex.lastIndex = 0;
      }
      enriched.push(remaining);
    }
  }
  parts = enriched.filter(p => p !== '');

  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-[#FFD700] underline hover:text-[#FFE44D] break-all">
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function SupportChat() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'assistant', text: 'Hola! Soy el asistente de Global Dorado. Preguntame sobre precios, metodos de pago, productos PLR o lo que necesites.' },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (msg?: string) => {
    const text = (msg || input).trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    
    // Obtener tasa desde el navegador (múltiples fuentes)
    let rate = '';
    const apis = [
      'https://bcv-api.deno.dev/api/v1/exchange-rate',
      'https://api.exchangemonitor.net/data',
      'https://pydolarve.org/api/v1/dollar?page=bcv',
    ];
    for (const url of apis) {
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (r.ok) {
          const d = await r.json();
          const found = d?.data?.rate || d?.BCV?.price || d?.monitors?.bcv?.price;
          if (found) { rate = String(found); break; }
        }
      } catch {}
    }

    setTimeout(async () => {
      try {
        const body: any = { message: text };
        if (rate) body.rate = rate;
        const { data } = await api.post('/ai/support', body);
        if (data?.response && !data.response.includes('IA no configurada')) {
          setMessages((prev) => [...prev, { role: 'assistant', text: data.response }]);
          return;
        }
      } catch {}
      const answer = findAnswer(text);
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    }, 300);
  };

  const quickBtns = ['Precios', 'Netflix', 'ChatGPT', 'Bolivares', 'Binance', 'Licencias', 'Canva', 'Contacto'];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in max-w-2xl mx-auto">
      <div className="text-center py-4">
        <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
          <IconChat className="w-5 h-5 text-[#FFD700]" /> Soporte Global Dorado
        </h2>
        <p className="text-gray-500 text-xs">Respuestas automaticas sobre precios, pagos y productos</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              msg.role === 'user'
                ? 'bg-[#FFD700] text-black rounded-br-md'
                : 'bg-[#111] border border-[#FFD700]/10 text-gray-200 rounded-bl-md'
            }`} style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.role === 'assistant' ? renderText(msg.text) : msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="px-4 pb-3">
        <div className="flex gap-2 mb-3 flex-wrap">
          {quickBtns.map((btn) => (
            <button
              key={btn}
              onClick={() => send(btn)}
              className="text-xs px-3 py-1.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/20 transition-colors"
            >
              {btn}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-[#111] border border-[#FFD700]/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/30"
            placeholder="Escribe tu pregunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button onClick={() => send()} className="bg-[#FFD700] text-black rounded-xl px-4 py-2.5 font-bold hover:bg-[#FFE44D] transition-colors">
            <IconSend className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
