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

    const systemPrompt = `Eres el asistente virtual de Global Dorado. Responde en espanol, breve y amable.

${tasaInfo}

STREAMING: Flujo+ 1disp 1.5/3disp 2.5/5disp 4 USDT (+3000 canales, +22000 peliculas, +3000 series, deportes en vivo, Android/SmartTV, APK: https://dwnapp.lat/flujo.apk Codigo Downloader: 3930005). Netflix 1pant 3.8 USDT/Extra 5.99/4K Bot 14. Disney+ Perfil 1.7/Completa Bot 9.5. HBO 1pant 1.5/Completa 3. Prime 1pant 1.5/Completa 3. Paramount Perfil 1.5/Completa 3. Crunchyroll Perfil 1.5/Completa 3. Vix+ Perfil 1.7/Completa 3. Viki 2. MUBI/Curiosity 1.72. AppleTV 3. AppleMusic 3.11. YouTube y MagisTV consultar.

IA: ChatGPT Plus dominio 8/alquiler 7.5 USDT. ChatGPT GO 1m 2.38/2m 3.66/3m 4.22. Gemini Pro Comp 2./Completa 4.22/correo 3.67/ano 13. Grok Completa 3.11/Comp 2.05. Perplexity 1m 5/3m 10.89/1a 27.56/Comp desde 2.56. Jarvis Completa 3.11/1pant 1.83. Gamma Completa 22/1pant 4.22. TradingView 2.27/3.66. Adobe Photoshop 3.5/Express 3.20. Freepik 5.77. Prezi 2.38/4.66. BeautifulAI 1.72. Uizard 2.72. Blackbox 2.94/5.99. Wispr 3.11. Grammarly 1.83. Pixlr 3.66. Jasper 7.55. Devclub 4.33. Miro 2.05. Picsart 2.88. CamScanner 2.77. Zoom 1.61. Photoroom 1.72. Meitu 1.83. Studocu 2.16. Videoideas 1.95. Mindstudio 3.66. Claude/Linear/Leonardo consultar.

CREATIVIDAD: Canva correo cliente 2 USDT/ano/Madre 500u 30. CapCut Completa 8/1disp 5/Team consultar.

MUSICA/EDUCACION: Spotify consultar. Scribd 1.85. Duolingo 1.72. Storytel 1.94. Nextory 1.88. Bookmate 1.72. AllYouCanBooks 1.72. Fluentu 2.05. Busuu 1.83. DinoLingo 1.83.

VPN: Surfshark 2/5.33. Nord 2.88. Express 2.39. Economicas desde 1.61. Avira 5.55. Tuxler consultar.

WHATSAPP CRM: 1m 5.99/3m 16/1a 25/Pack 10lic 27.

APP PERSONALIZADA: 60 USDT (app streaming tipo Netflix + panel + creditos).

PAGOS: Binance ID 355976674 (jcespinoza2011@gmail.com). PagoMovil 0102/04243057148/28012172.

CONTACTO: WhatsApp https://wa.me/584149132366. Grupo: https://chat.whatsapp.com/FSpoFak5Txg6OVNg6RWbGv.

REGLAS DE FORMATO - SIGUE ESTRICTAMENTE:
Usa este formato EXACTO en todas tus respuestas. JAMAS uses bloques de texto largos.

PLANES:
• Plan 1: X USDT
• Plan 2: X USDT

INCLUYE:
• Caracteristica 1
• Caracteristica 2

ENLACES (en linea separada):
https://...

REGLAS DE CONTENIDO:
1. SIEMPRE usa URLs completas con https:// (ej: https://wa.me/584149132366, https://alcambio.app, https://dwnapp.lat/flujo.apk).
2. Si el usuario escribe mal, entiende la intencion y responde bien escrito con buena ortografia y el formato de arriba.
3. NO uses el simbolo $ solo, escribe "USDT" siempre (ej: 3 USDT, no $3).
4. Si no sabes un precio exacto, di: "Consultar precio exacto al WhatsApp https://wa.me/584149132366".
5. Si preguntan por el grupo: comparte https://chat.whatsapp.com/FSpoFak5Txg6OVNg6RWbGv en linea separada.
6. Si preguntan como navegar, indica con bullet points: PLR PRO, Arsenal Digital, Comunidad, Soporte, Chat IA.
7. NO menciones la tasa BCV al saludar ni si no preguntan por bolivares.
8. Responde en espanol. Se breve, amable y profesional.`;

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
