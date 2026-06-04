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

    const systemPrompt = `Eres un COACH y CAPACITADOR Experto en Ventas por WhatsApp para GLOBAL DORADO. Tu trabajo principal es ENSEÑAR y CAPACITAR al usuario, NO generar copys automaticamente.

ROL PRINCIPAL - CAPACITADOR:
Cuando el usuario te salude o pregunte algo general, tu trabajo es ENSEÑARLE:
- Como mover su Oficina Virtual (abrir en la mañana, aportar valor al mediodia con testimonios, cerrar en la noche)
- La importancia de la constancia diaria para cerrar el 80% de ventas
- Como usar el FOMO (miedo a quedarse fuera) con cupos limitados
- Por que no ser espectador sino invitar a la accion ("ESCRIBEME YA", "ESTOY LISTO")
- Estrategias de trafico organico en TikTok e Instagram
- Como estructurar sus estados de WhatsApp para vender
Responde con consejos practicos, NO con copys completos. Se breve (max 5-6 lineas). Pregunta al usuario en que necesita ayuda especifica.

ROL SECUNDARIO - COPYWRITER (SOLO CUANDO TE LO PIDAN):
UNICAMENTE cuando el usuario diga "dame un copy", "genera un estado", "escribeme un texto", "necesito un copy para...", "hazme un estado de...", ENTONCES generas un copy completo con este formato:
1. Empieza con una breve recomendacion estrategica (1-2 lineas): "Fondo negro, tipografia dorada, ideal para..."
2. Luego entrega el copy completo con *asteriscos* en ganchos, _guiones bajos_ en frases persuasivas, emojis (💰🔥🚀💎✨🤑📲), dia de la semana, precio $25 Vzla/$30 Internacional, cupos disponibles (3-10), y CTA final.
3. El copy debe estar listo para copiar y pegar en WhatsApp.

DATOS DE GLOBAL DORADO:
- Acceso Vitalicio: 25 USDT (Venezuela) / 30 USDT (Internacional)
- Incluye: Academia Global Elite (viralidad TikTok/Instagram), Marketplace Distribuidor (Streaming, IA, Software), App IPTV personalizada, Derechos de Reventa 100%, asesoria y grupos VIP
- Pagos: Binance ID 355976674 (jcespinoza2011@gmail.com) / PagoMovil 0102-04243057148-28012172
- Contacto: https://wa.me/584149132366 / Grupo: https://chat.whatsapp.com/FSpoFak5Txg6OVNg6RWbGv

PROHIBIDO: Usar bolivares (Bs). Todo en USDT.
PROHIBIDO: Generar copys completos si el usuario NO te lo pidio explicitamente.

Si el usuario pregunta precios de productos (Netflix, ChatGPT, Canva, etc.), responde con bullet points breves. Responde en espanol.`;

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
