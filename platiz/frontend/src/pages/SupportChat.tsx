import { useState, useRef, useEffect } from 'react';
import { IconSend, IconChat } from '../icons/PremiumIcons';
import api from '../services/api';

// v2 - Jun 2026 - Catalogo actualizado

const KB: { keywords: string[]; answer: string }[] = [
  // STREAMING
  {
    keywords: ['netflix', 'nf'],
    answer: `NETFLIX
- 1 Dispositivo: 3 USDT
- Cuenta Completa con Bot de Codigo: 14 USDT
- Pantalla Extra: 5.99 USDT
- Premium 4K con Bot: 14 USDT`,
  },
  {
    keywords: ['disney', 'disney+', 'disney plus'],
    answer: `DISNEY PLUS
- Premium (Perfil): 1.7 USDT
- Cuenta Completa con Bot: 9.5 USDT`,
  },
  {
    keywords: ['hbo', 'hbo max'],
    answer: `HBO MAX
- Perfil: 1.5 USDT
- Cuenta Completa: 3 USDT`,
  },
  {
    keywords: ['prime', 'amazon', 'amazon prime'],
    answer: `AMAZON PRIME
- 1 Pantalla: 1.5 USDT
- Cuenta Completa: 3 USDT`,
  },
  {
    keywords: ['paramount', 'paramount+'],
    answer: `PARAMOUNT+
- Perfil: 1.5 USDT
- Cuenta Completa: 3 USDT`,
  },
  {
    keywords: ['crunchyroll', 'anime'],
    answer: `CRUNCHYROLL
- Perfil: 1.5 USDT
- Cuenta Completa: 3 USDT`,
  },
  {
    keywords: ['vix', 'vix+'],
    answer: `VIX PLUS
- Perfil: 1.7 USDT
- Cuenta Completa: 3 USDT`,
  },
  {
    keywords: ['magistv', 'flujo', 'flujotv', 'magis'],
    answer: `MAGISTV / FLUJOTV
- Cuenta: 3 USDT
- Completa: 3.5 USDT
- FlujoTV (BCV): 4.5$ BCV o 3 USDT`,
  },
  {
    keywords: ['youtube', 'youtube premium'],
    answer: `YOUTUBE PREMIUM
- Individual: 3 USDT
- Plan Familiar: consultar con el proveedor`,
  },
  {
    keywords: ['apple tv', 'apple music', 'appletv'],
    answer: `APPLE
- Apple TV (Completa): 3 USDT
- Apple Music (Familiar): 3.11 USDT`,
  },
  {
    keywords: ['mubi', 'curiosity', 'viki'],
    answer: `OTROS STREAMING
- MUBI / Curiosity Stream: 1.72 USDT
- Viki Rakuten: 2 USDT`,
  },

  // IA
  {
    keywords: ['chatgpt', 'gpt', 'openai'],
    answer: `CHATGPT PLUS
- Perfil: 4.5 USDT
- Cuenta Completa: 10 USDT
- Cuenta con correo incluido: 9 USDT
- Cuenta a dominio: 7.5 USDT
  
CHATGPT GO
- 1 disp (1 mes): 2.38 USDT
- 1 disp (2 meses): 3.66 USDT
- 1 disp (3 meses): 4.22 USDT`,
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
- 1 mes (1 pantalla compartido): 2.50 USDT
- 1 mes (Completa 5 disp): 4.22 USDT
- 1 mes (correo cliente): 3.67 USDT
- Ano completa: 13 USDT`,
  },
  {
    keywords: ['grok', 'grok ai'],
    answer: `GROK SUPER AI
- Cuenta completa (7 dias): 3.11 USDT
- Cuenta compartida (7 dias): 2.05 USDT`,
  },
  {
    keywords: ['perplexity', 'perplexity pro'],
    answer: `PERPLEXITY PRO
- 1 mes (5 disp): 5 USDT
- 3 meses: 10.89 USDT
- 6 meses: 19.22 USDT
- 1 ano: 27.56 USDT
- Compartida 1 disp: desde 2.56 USDT`,
  },
  {
    keywords: ['gamma', 'gamma app'],
    answer: `GAMMA APP AI PLUS
- Cuenta completa: 22 USDT
- 1 pantalla: 4.22 USDT`,
  },
  {
    keywords: ['adobe', 'photoshop', 'express'],
    answer: `ADOBE Y HERRAMIENTAS
- Photoshop Web (1 pantalla): 3.5 USDT
- Adobe Express (1 pantalla): 3.20 USDT
- Freepik AI Premium (1 disp): 5.77 USDT`,
  },
  {
    keywords: ['grammarly', 'jasper', 'pixlr', 'claude', 'prezi', 'beautiful ai', 'uizard', 'black box', 'wispr'],
    answer: `HERRAMIENTAS IA PRO
- Grammarly Pro: desde 1.83 USDT
- Jasper AI Pro (7 dias): 7.55 USDT
- Pixlr Premium: 3.66 USDT
- Claude Pro: consultar
- Prezi AI Plus: 1 pantalla 2.38 USDT / Completa 4.66 USDT
- Beautiful AI: 1.72 USDT
- Uizard Pro: 2.72 USDT
- Black Box Pro Max: 1 pant 2.94 USDT / Completa 5.99 USDT
- Wispr Flow AI: 3.11 USDT`,
  },

  // CREATIVIDAD
  {
    keywords: ['canva', 'canva pro'],
    answer: `CANVA PRO
- Correo del cliente: 1.5 USDT (ANO)
- Cuenta Madre (500 cuentas): consultar
- Revendedor: 1.5 USDT
- Panel 500 usuarios: 30 USDT`,
  },
  {
    keywords: ['capcut', 'capcut pro'],
    answer: `CAPCUT PRO
- Cuenta Completa: 4 USDT
- 1 Dispositivo: 2.5 USDT
- Capcut Team: consultar`,
  },

  // MUSICA
  {
    keywords: ['spotify', 'musica'],
    answer: `SPOTIFY
- Individual: 3.5 USDT
- Plan Familiar: 8 USDT`,
  },

  // LECTURA / EDUCACION
  {
    keywords: ['duolingo', 'idioma', 'idiomas', 'scribd', 'lectura', 'aprendizaje', 'libros'],
    answer: `LECTURA Y APRENDIZAJE
- Scribd + Everand: 1.85 USDT
- Duolingo Super: 1.72 USDT
- Storytel: 1.94 USDT
- Nextory: 1.88 USDT
- Bookmate: 1.72 USDT
- All You Can Books: 1.72 USDT
- Fluentu / Talkpal (14 dias): 2.05 USDT
- Busuu: 1.83 USDT`,
  },

  // VPN
  {
    keywords: ['vpn', 'surfshark', 'nord', 'express vpn', 'avira'],
    answer: `VPNS Y ANTIVIRUS
- Surfshark VPN (1 mes): 2 USDT / Completa: 5.33 USDT
- Express VPN (1 mes): 2.39 USDT
- Nord VPN (1 mes): 2.88 USDT
- VPN Economicas: desde 1.61 USDT
- Avira Antivirus (3 meses): 5.55 USDT`,
  },

  // OTROS
  {
    keywords: ['app', 'aplicacion', 'personalizada', 'iptv', 'tv box', 'netflix app', 'propia app'],
    answer: `APPS PERSONALIZADAS TIPO NETFLIX/IPTV
Creamos tu propia app de streaming:
- Diseno profesional
- Interfaz moderna
- Funcional para TV Box, Android, Fire TV
- Lista para vender
- Entrega rapida
- Vendemos archivos completos para que tu las hagas

Pedidos: @GlobalDorado`,
  },
  {
    keywords: ['productividad', 'zoom', 'photoroom', 'studocu'],
    answer: `PRODUCTIVIDAD
- Zoom (14 dias): 1.61 USDT
- Photoroom Max: 1.72 USDT
- Meitu: 1.83 USDT
- Studocu: 2.16 USDT
- Videoideas.ai: 1.95 USDT
- Cam Scanner: 2.77 USDT
- Miro AI Premium: 2.05 USDT
- Mindstudio Plus: 3.66 USDT`,
  },
  {
    keywords: ['whatsapp', 'crm', 'black crm'],
    answer: `SOFTWARE WHATSAPP (BLACK CRM)
- 1 mes: 5.99 USDT
- 3 meses: 16 USDT
- 1 ano: 25 USDT
- Pack Revendedor (10 licencias): 27 USDT`,
  },
  {
    keywords: ['trading', 'trading view'],
    answer: `TRADING VIEW PLUS
- 1 pantalla (sin garantia): 2.27 USDT
- 1 pantalla (garantia 7 dias): 3.66 USDT`,
  },
  {
    keywords: ['picsart', 'picsart premium'],
    answer: `PICSART PREMIUM: 2.88 USDT`,
  },

  // GENERAL
  {
    keywords: ['precio', 'precios', 'cuesta', 'cuanto', 'cuánto', 'catalogo', 'lista'],
    answer: `CATALOGO DE PRECIOS - Global Dorado

STREAMING: Netflix 3-14 USDT | Disney 1.7-9.5 | HBO 1.5-3 | Prime 1.5-3 | Paramount 1.5-3 | Crunchyroll 1.5-3 | YouTube 3 | Vix 1.7-3 | MagisTV 3-3.5 | Apple TV 3

IA: ChatGPT Plus 4.5-10 | Gemini Pro 2.5-4.22 | Grok 2.05-3.11 | Perplexity 2.56-5 | Jarvis 1.83-3.11 | Gamma 4.22-22

CREATIVIDAD: Canva Pro 1.5 | CapCut 2.5-4 | Adobe 3.2-3.5

MUSICA: Spotify 3.5-8 | Apple Music 3.11

EDUCACION: Duolingo 1.72 | Scribd 1.85

VPN: Surfshark 2 | Nord 2.88 | Express 2.39

Pregunta por un producto especifico para ver el precio exacto.`,
  },
  {
    keywords: ['bolivar', 'bolivares', 'bs', 'ves', 'tasa', 'cambio', 'dolar hoy'],
    answer: `CONVERSION A BOLIVARES

Los precios estan en USDT/dolares. Multiplica por la tasa del dia para obtener el monto en bolivares.

Ejemplo (tasa ref ~60 Bs/USD):
- Netflix 1 disp (3 USDT) = ~180 Bs
- ChatGPT Plus (4.5 USDT) = ~270 Bs
- Canva Pro (1.5 USDT) = ~90 Bs
- Disney+ (1.7 USDT) = ~102 Bs

La tasa varia. Confirma con el admin el monto exacto al momento del pago.`,
  },
  {
    keywords: ['binance', 'usdt', 'cripto', 'pago', 'pagar', 'metodo', 'transferencia', 'movil', 'zelle'],
    answer: `METODOS DE PAGO

Aceptamos:
- Binance (USDT) - ID: 355976674 - jcespinoza2011@gmail.com
- Pago movil: 0102 / 04243057148 / 28012172
- Transferencia bancaria (Bs)

Para pagar por Binance:
1. Transfiere los USDT a nuestra wallet
2. Envia el comprobante al admin
3. Recibes acceso inmediato

Tiempo de entrega: 5-10 minutos`,
  },
  {
    keywords: ['contacto', 'contactar', 'admin', 'whatsapp', 'telegram', 'hablar', 'escribir'],
    answer: `CONTACTO

Escribenos por WhatsApp: https://wa.me/584149132366

Disponible en PC y telefono. Atendemos rapido por mensaje directo.

Grupo de Revendedores: https://chat.whatsapp.com/FSpoFak5Txg6OVNg6RWbGv
Telegram: consulta el boton azul abajo a la derecha

Horario de atencion: todos los dias.`,
  },
  {
    keywords: ['garantia', 'entrega', 'envio', 'recibir', 'acceso', 'tiempo'],
    answer: `ENTREGA Y GARANTIA
- Tiempo de entrega: 5 a 10 minutos (la mayoria de servicios)
- Servicio seguro y confiable
- Al completar tu pago, recibes acceso inmediato
- Soporte por WhatsApp/Telegram ante cualquier problema`,
  },
  {
    keywords: ['revendedor', 'revender', 'reventa', 'pack revendedor'],
    answer: `PROGRAMA DE REVENDEDORES
Vende todos nuestros servicios a tus propios clientes. Precios especiales para revendedores.

- Black CRM Pack Revendedor: 27 USDT (10 licencias)
- Canva Pro Revendedor: 1.5 USDT
- Grupo de Revendedores: https://chat.whatsapp.com/FSpoFak5Txg6OVNg6RWbGv

Unete al grupo para recibir promociones y soporte.`,
  },
  {
    keywords: ['plr', 'guia', 'guias', 'plantilla', 'plantillas', 'ebook', 'mockup', 'kit de marca'],
    answer: `PLR PRO - Productos con Derechos de Reventa

Consulta la seccion PLR PRO en el menu lateral para ver +190 guias y plantillas que puedes personalizar y revender:
- Guias PLR (Canva): $7-$77
- Plantillas Ebooks: $7-$47
- Kits de Marca: $7-$67
- Mockups: $7-$67
- Video/Contenido: $10-$77
- Pinterest: $5-$47
- Planners: $7-$27

Todos los productos son 100% editables en Canva. Tu pones tu precio final.`,
  },
  {
    keywords: ['licencia', 'licencias', 'office', 'windows', 'eset', 'autodesk', 'autocad', 'adobe creative', 'corel', 'coreldraw', 'photoshop', 'illustrator', 'ilustrator', 'programa', 'programas', 'software', 'instalacion'],
    answer: `LICENCIAS E INSTALACION DE PROGRAMAS

Consultar precio del programa que necesites.

Office 365 Premium
Office 365 Personal
Office 2021
Office 2024
Windows 10 Pro
Windows 11 Pro
Eset NOD32
Eset Internet Security
Autodesk (Autocad, Civil 3D, Revit, Inventor, Fusion, Maya)
Adobe Creative (1 PC o 2 PC)
CorelDRAW 2021, 2023, 2025
Photoshop 2021, 2025
Illustrator 2021, 2025
Camtasia 22, 25
Filmora 10, 12, 14
SketchUp 2021, 2023, 2025
Lumion 10, 11, 12
Rhinoceros v6, v7, v8
Solidworks 2016, 2018, 2021, 2023, 2024
Virtual DJ v21, v25
Wilcom e4.2
Optitex 21, 23, 24, 25
Audaces 7
Tajima 16, 17
Proteus
Pronest 2019, 2021
LightBurn 1.7
Singmaster v3, v5
Archicad v26, v27, v28
CSI Etabs, SAP2000, SAFE, Bridge
Bartender 2016, 2019, 2022
Nitro PDF 14 Pro
Adobe Acrobat 22
S10 Presupuestos

Instalacion via AnyDesk / UltraViewer.
Contacto: @GlobalDorado`,
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

  return ''; // Devolver vacio para que intente IA
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

  const send = (msg?: string) => {
    const text = (msg || input).trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setTimeout(async () => {
      const answer = findAnswer(text);
      if (answer) {
        setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
        return;
      }
      // IA gratis via backend proxy
      try {
        const { data } = await api.post('/ai/support', { message: text });
        setMessages((prev) => [...prev, { role: 'assistant', text: data.response }]);
      } catch {
        setMessages((prev) => [...prev, { role: 'assistant', text: `No tengo info sobre "${text}". Prueba: Netflix, ChatGPT, precios, binance, licencias.` }]);
      }
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
