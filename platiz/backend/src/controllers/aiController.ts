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

    if (provider?.api_key) {
      // Usar provider configurado (OpenAI, Gemini, etc)
      const { data: history } = await supabase.from('chat_messages').select('role, content').eq('conversation_id', convId).order('created_at', { ascending: true }).limit(20);
      const messages: any[] = [];
      if (provider.system_prompt) messages.push({ role: 'system', content: provider.system_prompt });
      if (history) history.forEach((m: any) => messages.push({ role: m.role, content: m.content }));

      try {
        const aiResp = await fetch(provider.api_url, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provider.api_key}` },
          body: JSON.stringify({ model: provider.model || 'gpt-3.5-turbo', messages, temperature: 0.7, max_tokens: 1000 }),
        });
        const aiData = await aiResp.json();
        responseText = aiData.error ? `Error IA: ${aiData.error.message}` : aiData.choices?.[0]?.message?.content || JSON.stringify(aiData);
      } catch (e: any) {
        responseText = `Error: ${e.message}`;
      }
    } else {
      // Fallback: usar Pollinations.ai gratis
      try {
        const polliResp = await fetch('https://text.pollinations.ai/', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'Eres asistente de Global Dorado. Responde en espanol, breve y amable. Habla de precios en USDT, streaming, IA, software. WhatsApp +584149132366. Binance ID 355976674.' },
              { role: 'user', content: message },
            ],
            model: 'openai',
          }),
        });
        responseText = await polliResp.text();
      } catch (e: any) {
        responseText = `Error de conexion: ${e.message}`;
      }
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
    const { message } = req.body;
    if (!message) { res.status(400).json({ error: 'Message required' }); return; }
    
    let text = '';
    let retries = 0;
    while (retries < 3) {
      const r = await fetch('https://text.pollinations.ai/' + encodeURIComponent(message) + '?model=openai&seed=' + Date.now());
      if (r.status === 429) {
        retries++;
        await new Promise(r => setTimeout(r, 2000 * retries));
        continue;
      }
      text = await r.text();
      break;
    }
    
    if (!text) text = 'Lo siento, el servicio de IA esta ocupado ahora. Prueba de nuevo en unos segundos o usa las palabras clave sugeridas en los botones.';
    res.json({ response: text });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
