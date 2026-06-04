import { useState, useRef, useEffect } from 'react';
import { IconSend, IconChat } from '../icons/PremiumIcons';
import api from '../services/api';

// v3 - Jun 2026 - Precios en actualizacion

const KB: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['precio', 'precios', 'cuesta', 'cuanto', 'cuánto', 'catalogo', 'lista'],
    answer: `CATALOGO EN ACTUALIZACION
Los precios se estan actualizando. Contacta al admin para informacion.

Escribenos por WhatsApp: https://wa.me/584149132366`,
  },
  {
    keywords: ['bolivar', 'bolivares', 'bs', 'ves', 'tasa', 'cambio', 'dolar hoy'],
    answer: `CONVERSION A BOLIVARES
Multiplica el precio en USDT por la tasa del dia.

Revisa la tasa en: https://alcambio.app

Ejemplo con tasa aprox:
- 1 USDT x tasa del dia = Bs`,
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

Atendemos rapido por mensaje directo.`,
  },
  {
    keywords: ['garantia', 'entrega', 'envio', 'recibir', 'acceso', 'tiempo'],
    answer: `ENTREGA Y GARANTIA
- Tiempo de entrega: 5 a 10 minutos
- Servicio seguro y confiable
- Soporte por WhatsApp/Telegram`,
  },
  {
    keywords: ['revendedor', 'revender', 'reventa', 'pack revendedor'],
    answer: `PROGRAMA DE REVENDEDORES
Vende todos nuestros servicios a tus propios clientes. Precios especiales para revendedores.

Unete al grupo: https://chat.whatsapp.com/FSpoFak5Txg6OVNg6RWbGv`,
  },
  {
    keywords: ['plr', 'guia', 'guias', 'plantilla', 'plantillas', 'ebook', 'mockup', 'kit de marca'],
    answer: `PLR PRO - +190 productos con derechos de reventa
Visita la seccion PLR PRO en el menu lateral para ver todas las guias y plantillas.`,
  },
  {
    keywords: ['licencia', 'licencias', 'programa', 'programas', 'software', 'instalacion'],
    answer: `LICENCIAS E INSTALACION DE PROGRAMAS
Consultar precio del programa que necesites. Ofrecemos instalacion via AnyDesk/UltraViewer.

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
  // Convertir URLs en enlaces clickeables
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
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
