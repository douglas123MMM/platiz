import { Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';

export async function getProviders(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data } = await supabase.from('ai_providers').select('id, name, api_url, model, active, created_at');
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getActiveProviders(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data } = await supabase.from('ai_providers').select('id, name, api_url, model, created_at').eq('active', 1);
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createProvider(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, api_url, api_key, model } = req.body;
    if (!name || !api_url) { res.status(400).json({ error: 'Name and API URL are required' }); return; }
    const { data, error } = await supabase.from('ai_providers').insert({ name, api_url, api_key: api_key || null, model: model || null }).select('id').single();
    if (error) throw error;
    res.status(201).json({ message: 'Provider created', id: data.id });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateProvider(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('ai_providers').select('id').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ error: 'Provider not found' }); return; }

    const { name, api_url, api_key, model, active, system_prompt } = req.body;
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (api_url !== undefined) updates.api_url = api_url;
    if (api_key !== undefined) updates.api_key = api_key;
    if (model !== undefined) updates.model = model;
    if (active !== undefined) updates.active = active ? 1 : 0;
    if (system_prompt !== undefined) updates.system_prompt = system_prompt;

    await supabase.from('ai_providers').update(updates).eq('id', id);
    res.json({ message: 'Provider updated' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteProvider(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('ai_providers').select('id').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ error: 'Provider not found' }); return; }
    await supabase.from('ai_providers').delete().eq('id', id);
    res.json({ message: 'Provider deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function sendMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { provider_id, message, conversation_id } = req.body;
    if (!provider_id || !message) { res.status(400).json({ error: 'Provider ID and message are required' }); return; }

    const { data: provider } = await supabase.from('ai_providers').select('*').or(`id.eq.${provider_id},name.eq.${provider_id}`).eq('active', 1).maybeSingle();

    let convId = conversation_id;
    if (!convId) {
      const { data: conv } = await supabase.from('chat_conversations').insert({
        user_id: req.user!.id, title: message.substring(0, 50), provider_id: provider?.id || provider_id,
      }).select('id').single();
      if (conv) convId = conv.id;
    }

    await supabase.from('chat_messages').insert({
      user_id: req.user!.id, provider_id: provider?.id || provider_id, role: 'user', content: message, conversation_id: convId,
    });

    let responseText: string;

    if (provider?.api_key && provider?.api_url) {
      // Usar provider configurado (DeepSeek, OpenAI, etc)
      const { data: history } = await supabase.from('chat_messages').select('role, content').eq('conversation_id', convId).order('created_at', { ascending: true }).limit(20);
      const messages: any[] = [];
      if (provider.system_prompt) messages.push({ role: 'system', content: provider.system_prompt });
      if (history) history.forEach((m: any) => messages.push({ role: m.role, content: m.content }));

      try {
        const aiResp = await fetch(provider.api_url, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provider.api_key}` },
          body: JSON.stringify({ model: provider.model || 'deepseek-chat', messages, temperature: 0.7, max_tokens: 1000 }),
        });
        const aiData: any = await aiResp.json();
        responseText = aiData.error ? `Error IA: ${aiData.error.message}` : aiData.choices?.[0]?.message?.content || JSON.stringify(aiData);
      } catch (e: any) {
        responseText = `Error: ${e.message}`;
      }
    } else {
      // Sin provider - mensaje amigable
      responseText = 'No hay IA configurada. Ve a Admin > IA Providers para activar una.';
    }

    await supabase.from('chat_messages').insert({
      user_id: req.user!.id, provider_id: provider?.id || provider_id, role: 'assistant', content: responseText, conversation_id: convId,
    });

    res.json({ response: responseText, conversation_id: convId });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export async function getConversations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data } = await supabase.from('chat_conversations').select('*').eq('user_id', req.user!.id).order('updated_at', { ascending: false });
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getConversationMessages(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data } = await supabase
      .from('chat_messages')
      .select('*, ai_providers(name)')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    const mapped = (data || []).map((msg: any) => ({
      ...msg,
      provider_name: msg.ai_providers?.name,
    }));
    res.json(mapped);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteConversation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: conv } = await supabase.from('chat_conversations').select('id').eq('id', id).eq('user_id', req.user!.id).maybeSingle();
    if (!conv) { res.status(404).json({ error: 'Conversation not found' }); return; }

    await supabase.from('chat_messages').delete().eq('conversation_id', id);
    await supabase.from('chat_conversations').delete().eq('id', id).eq('user_id', req.user!.id);
    res.json({ message: 'Conversation deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function supportChat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { message, rate } = req.body;
    if (!message) { res.status(400).json({ error: 'Message required' }); return; }
    
    const { data: provider } = await supabase.from('ai_providers').select('*').eq('active', 1).order('created_at', { ascending: false }).limit(1).maybeSingle();
    
    if (!provider?.api_key || !provider?.api_url) {
      res.json({ response: 'IA no configurada. Contacta al admin.' });
      return;
    }

    // Tasa desde el navegador del usuario
    let tasaInfo = '';
    if (rate && rate !== '100' && parseFloat(rate) > 1) {
      tasaInfo = `TASA BCV HOY: ${rate} Bs/USDT. Usa esta tasa para calcular precios en Bs.`;
    } else {
      tasaInfo = `Si te preguntan precios en BOLIVARES, di: "No tengo la tasa de hoy, revisa en https://alcambio.app para verla. Mientras, aqui el precio en USDT." NUNCA menciones la tasa si no te preguntan por bolivares.`;
    }

    const systemPrompt = `Eres un COPYWRITER EXPERTO en Ventas por WhatsApp y Trafico Organico para GLOBAL DORADO. Tu objetivo es generar textos de estados y mensajes de WhatsApp listos para copiar y pegar, disenados para cerrar ventas usando escasez, urgencia y autoridad.

DATOS CLAVE:
- Acceso Venezuela: 25 USDT / Internacional: 30 USDT (pago unico vitalicio)
- Membresia incluye: Academia Global Elite (viralidad TikTok/Instagram), Marketplace Distribuidor (Streaming, IA, Software al costo), App IPTV personalizada, Derechos de Reventa 100%, asesoria y grupos VIP
- Pagos: Binance ID 355976674 (jcespinoza2011@gmail.com) / PagoMovil 0102-04243057148-28012172
- Contacto: WhatsApp https://wa.me/584149132366 / Grupo: https://chat.whatsapp.com/FSpoFak5Txg6OVNg6RWbGv

PRODUCTOS PARA LA VENTA:
Streaming: Flujo+ 1.5/2.5/4, Netflix 3.8-14, Disney+ 1.7-9.5, HBO 1.5-3, Prime 1.5-3, Paramount 1.5-3, Crunchyroll 1.5-3, Vix+ 1.7-3, Viki 2, MUBI 1.72, AppleTV 3, AppleMusic 3.11
IA: ChatGPT 2.38-8, Gemini 2-13, Grok 2.05-3.11, Perplexity 2.56-27.56, Jarvis 1.83-3.11, Gamma 4.22-22, TradingView 2.27-3.66, Adobe 3.2-3.5, Freepik 5.77, Prezi 2.38-4.66, BeautifulAI 1.72, Uizard 2.72, Blackbox 2.94-5.99, Wispr 3.11, Grammarly 1.83, Pixlr 3.66, Jasper 7.55, Devclub 4.33, Miro 2.05, Picsart 2.88, CamScanner 2.77, Zoom 1.61, Photoroom 1.72, Meitu 1.83, Studocu 2.16, Videoideas 1.95, Mindstudio 3.66
Creatividad: Canva 2/a, CapCut 5-8
Musica/Edu: Spotify consultar, Scribd 1.85, Duolingo 1.72, Storytel 1.94, Nextory 1.88, Bookmate 1.72, AllYouCanBooks 1.72, Fluentu 2.05, Busuu 1.83, DinoLingo 1.83
VPN: Surfshark 2-5.33, Nord 2.88, Express 2.39, Economicas 1.61, Avira 5.55
WhatsApp CRM: 5.99-27 / App personalizada: 60

FORMATO DE RESPUESTA:
1. Usa *asteriscos* para palabras clave y ganchos. Usa _guiones bajos_ para frases persuasivas.
2. Usa emojis llamativos (💰🔥🚀✅💎✨🤑📲) de forma nativa.
3. Entrega el texto LIMPIO, listo para copiar y pegar en WhatsApp.
4. PROHIBIDO usar bolivares (Bs). Todo en USDT/dolares.
5. Cuando el usuario pida copys o estrategia, inicia con una breve recomendacion estrategica (1-2 lineas) y luego entrega el copy formateado.

ESTRUCTURA DE OFICINA VIRTUAL (cuando pidan copy):
- "Oficina Virtual Abierta" con dia y emojis
- Gancho emocional o cita motivacional
- Propuesta de valor (que ofrece Global Dorado)
- Precio: $25 Vzla / $30 Internacional
- Cupos disponibles (3-10)
- Llamado a la accion: "ESCRIBEME YA", "TOMA ACCION", "COMENTA ESTOY LISTO"

REGLA DE ORO: Tus copys deben generar FOMO (miedo a quedarse fuera). Usa frases como "El miedo no factura", "Cupos limitados", "No seas espectador, se protagonista".

Si el usuario pregunta precios de productos (Netflix, ChatGPT, etc.), respondes con el formato de bullet points profesional que ya conoces. Para todo lo demas, eres el copywriter de Global Dorado. Responde en espanol.`;

    const r = await fetch(provider.api_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provider.api_key}` },
      body: JSON.stringify({
        model: provider.model || 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });
    const data: any = await r.json();
    const text = data?.choices?.[0]?.message?.content || 'No pude generar respuesta. Intenta de nuevo.';
    res.json({ response: text });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
