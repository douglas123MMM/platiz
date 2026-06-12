import { Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';

export async function getSettings(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('settings').select('*').maybeSingle();
    if (error && error.message.includes('does not exist')) {
      res.json({ whatsapp: '', telegram: '', guias: {} });
      return;
    }
    const settings = data || { whatsapp: '', telegram: '', binance: '', pagomovil: '', whatsapp_group: '' };
    const { data: guideItems } = await supabase.from('items').select('title,description').eq('category_slug', 'settings').in('title', ['guia_plr_pro', 'guia_services', 'guia_telegram', 'bcv_rate']);
    const guias: Record<string, string> = {};
    let bcv_rate = '';
    if (guideItems) guideItems.forEach((g: any) => {
      if (g.title === 'bcv_rate') bcv_rate = g.description || '';
      else guias[g.title] = g.description || '';
    });
    res.json({ ...settings, bcv_rate, guias });
  } catch {
    res.json({ whatsapp: '', telegram: '', guias: {} });
  }
}

export async function updateSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { whatsapp, telegram, binance, pagomovil, whatsapp_group, bcv_rate, iptv_m3u_url, guias } = req.body;
    const { data: existing } = await supabase.from('settings').select('id').maybeSingle();
    const updateData: any = { whatsapp, telegram, updated_at: new Date().toISOString() };
    if (iptv_m3u_url !== undefined) updateData.iptv_m3u_url = iptv_m3u_url;
    if (binance !== undefined) updateData.binance = binance;
    if (pagomovil !== undefined) updateData.pagomovil = pagomovil;
    if (whatsapp_group !== undefined) updateData.whatsapp_group = whatsapp_group;
    if (existing) {
      await supabase.from('settings').update(updateData).eq('id', existing.id);
    } else {
      await supabase.from('settings').insert({ id: 1, ...updateData }).select('id').single();
    }
    if (bcv_rate !== undefined) {
      const { data: rateItem } = await supabase.from('items').select('id').eq('category_slug', 'settings').eq('title', 'bcv_rate').maybeSingle();
      if (rateItem) {
        await supabase.from('items').update({ description: bcv_rate, updated_at: new Date().toISOString() }).eq('id', rateItem.id);
      } else {
        await supabase.from('items').insert({
          category_slug: 'settings', title: 'bcv_rate', description: bcv_rate,
          sort_order: 0, active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        });
      }
    }
    if (guias && typeof guias === 'object') {
      for (const [key, text] of Object.entries(guias)) {
        const { data: item } = await supabase.from('items').select('id').eq('category_slug', 'settings').eq('title', key).maybeSingle();
        if (item) {
          await supabase.from('items').update({ description: text, updated_at: new Date().toISOString() }).eq('id', item.id);
        } else {
          await supabase.from('items').insert({
            category_slug: 'settings', title: key, description: text,
            sort_order: 0, active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
          });
        }
      }
    }
    res.json({ message: 'Settings updated' });
  } catch (e: any) {
    if (e.message?.includes('does not exist')) {
      res.status(500).json({ error: 'La tabla settings no existe. Ejecuta el SQL de migracion.' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
