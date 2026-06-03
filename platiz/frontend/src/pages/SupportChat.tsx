import { useState, useRef, useEffect } from 'react';
import { IconSend, IconChat } from '../icons/PremiumIcons';

const KB: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['precio', 'precios', 'cuesta', 'cuestan', 'valor', 'cuanto', 'cuánto', 'tarifa'],
    answer: `GUIA DE PRECIOS PLR PRO - Global Dorado

GUIAS PLR (Canva): $7-$77
PLANTILLAS EBOOKS: $7-$47
KITS DE MARCA: $7-$67
MOCKUPS: $7-$67
VIDEO Y CONTENIDO: $10-$77
PINTEREST: $5-$47
PLANNERS: $7-$27

Precios exactos dependen del producto. Consulta la seccion PLR PRO para ver cada guia con su enlace.`,
  },
  {
    keywords: ['bolivar', 'bolivares', 'bs', 'ves', 'tasa', 'cambio', 'dolar hoy'],
    answer: `CONVERSION A BOLIVARES

Los precios estan en dolares. Para convertir a bolivares, multiplica por la tasa del dia.

Ejemplo con tasa de ~60 Bs/USD:
- Guia de $7 = 420 Bs
- Guia de $17 = 1.020 Bs
- Guia de $47 = 2.820 Bs
- Kit de Marca $37 = 2.220 Bs

La tasa varia diariamente. Confirmar con el admin el monto exacto en Bs al momento del pago.`,
  },
  {
    keywords: ['binance', 'usdt', 'cripto', 'crypto', 'bitcoin', 'btc', 'pago', 'pagar', 'metodo', 'metodos', 'transferencia', 'movil', 'zelle'],
    answer: `METODOS DE PAGO

Aceptamos:
- Binance (USDT) - el monto en USDT es igual al precio en dolares
- Transferencia bancaria (Bs)
- Pago movil (Bs)

Para pagar por Binance:
1. Transfiere los USDT a nuestra wallet
2. Envia el comprobante al admin
3. Recibes acceso inmediato a tus productos

Contacta al admin para coordinar el pago y recibir los datos de la wallet.`,
  },
  {
    keywords: ['contacto', 'contactar', 'admin', 'whatsapp', 'telegram', 'hablar', 'escribir'],
    answer: `CONTACTO

Puedes comunicarte con nosotros por:
- WhatsApp (boton verde abajo a la derecha)
- Telegram (boton azul abajo a la derecha)

El admin te atendera para:
- Confirmar tu compra
- Enviarte datos de pago
- Resolver cualquier duda`,
  },
  {
    keywords: ['plr', 'que es', 'derechos', 'reventa', 'revender', 'uso', 'usar', 'licencia'],
    answer: `QUE ES PLR?

PLR (Private Label Rights) significa que al comprar una guia o plantilla, obtienes los derechos para:
- Personalizarla con tu nombre y marca
- Revenderla a tus propios clientes
- Usarla como contenido en tus redes
- Modificarla como quieras

Son productos 100% editables en Canva. Tu pones tu precio y te quedas con el 100% de las ganancias.`,
  },
  {
    keywords: ['envio', 'entrega', 'recibir', 'acceso', 'descargar', 'descarga', 'link'],
    answer: `ENTREGA Y ACCESO

Al completar tu compra:
1. Recibes acceso inmediato a los enlaces de Canva
2. Cada guia tiene su propio enlace "Ver guia en Canva"
3. Puedes hacer una copia a tu cuenta de Canva gratis
4. Editas, personalizas y vendes como tuyo

Todo el material se entrega de forma digital. No hay envios fisicos.`,
  },
];

function findAnswer(msg: string): string {
  const lower = msg.toLowerCase();
  let bestMatch: { answer: string; score: number } | null = null;

  for (const entry of KB) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { answer: entry.answer, score };
    }
  }

  if (bestMatch) return bestMatch.answer;

  return `Gracias por tu mensaje. No tengo una respuesta automatica para eso, pero aqui tienes opciones:

1. Consulta la seccion PLR PRO para ver todos los productos
2. Revisa la Guia de Precios (boton dorado abajo)
3. Contacta al admin por WhatsApp o Telegram

Escribe palabras como: precios, bolivares, binance, pago, plr, envio, contacto.`;
}

export default function SupportChat() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'assistant', text: 'Hola! Soy el asistente de Global Dorado. Preguntame sobre precios, metodos de pago, productos PLR o lo que necesites.' },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setTimeout(() => {
      const answer = findAnswer(text);
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    }, 500);
  };

  const quickBtns = ['Precios', 'Bolivares', 'Binance', 'Que es PLR', 'Contacto', 'Envio'];

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
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
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
              onClick={() => { setInput(btn); setTimeout(() => send(), 100); }}
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
          <button onClick={send} className="bg-[#FFD700] text-black rounded-xl px-4 py-2.5 font-bold hover:bg-[#FFE44D] transition-colors">
            <IconSend className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
